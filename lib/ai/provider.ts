import { createOpenAI } from "@ai-sdk/openai";
import { createGateway, type LanguageModel } from "ai";

export type AiProviderName = "openrouter" | "vercel" | "agentrouter";

export function getAiProviderName(): AiProviderName {
  const provider = process.env.AI_PROVIDER?.toLowerCase();

  if (provider === "vercel") {
    return "vercel";
  }

  if (provider === "agentrouter") {
    return "agentrouter";
  }

  return "openrouter";
}

export function getAiApiKey(
  credentials?: { AI_GATEWAY_API_KEY?: string }
): string | undefined {
  return (
    credentials?.AI_GATEWAY_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.AI_GATEWAY_API_KEY ||
    process.env.OPENAI_API_KEY
  );
}

export function getWorkflowModel(): string {
  return (
    process.env.AI_WORKFLOW_MODEL ||
    process.env.OPENROUTER_MODEL ||
    "openai/gpt-4o-mini"
  );
}

export function getModelString(modelId: string): string {
  if (modelId.includes("/")) {
    return modelId;
  }

  if (modelId.startsWith("claude-")) {
    return `anthropic/${modelId}`;
  }

  if (modelId.startsWith("gpt-") || modelId.startsWith("o1-")) {
    return `openai/${modelId}`;
  }

  return modelId;
}

function getOpenAiCompatibleBaseUrl(): string {
  if (getAiProviderName() === "agentrouter") {
    return process.env.AGENTROUTER_BASE_URL || "https://agentrouter.org/v1";
  }

  return process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
}

function getOpenRouterHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  const referer =
    process.env.OPENROUTER_HTTP_REFERER ||
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const appName = process.env.OPENROUTER_APP_NAME || "Graphitti Workflows";

  headers["HTTP-Referer"] = referer;
  headers["X-Title"] = appName;

  return headers;
}

function createOpenRouterClient(apiKey: string) {
  return createOpenAI({
    baseURL: getOpenAiCompatibleBaseUrl(),
    apiKey,
    headers: getOpenRouterHeaders(),
  });
}

export function createAiLanguageModel(
  modelId: string,
  apiKey?: string
): LanguageModel {
  const key = apiKey ?? getAiApiKey();

  if (!key) {
    throw new Error("AI API key not configured");
  }

  const model = getModelString(modelId);

  if (getAiProviderName() === "vercel") {
    const gateway = createGateway({ apiKey: key });
    return gateway(model);
  }

  const openrouter = createOpenRouterClient(key);
  return openrouter(model);
}

export function createAiImageModel(modelId: string, apiKey?: string) {
  const key = apiKey ?? getAiApiKey();

  if (!key) {
    throw new Error("AI API key not configured");
  }

  const model = getModelString(modelId);

  if (getAiProviderName() === "vercel") {
    const gateway = createGateway({ apiKey: key });
    return gateway.imageModel(model);
  }

  const openrouter = createOpenRouterClient(key);
  return openrouter.image(model);
}
