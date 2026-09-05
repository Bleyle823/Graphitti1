import { generateText } from "ai";
import { createAiLanguageModel } from "@/lib/ai/provider";

export async function testAiGateway(credentials: Record<string, string>) {
  try {
    const apiKey = credentials.AI_GATEWAY_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "AI_GATEWAY_API_KEY is required",
      };
    }

    await generateText({
      model: createAiLanguageModel("openai/gpt-4o-mini", apiKey),
      prompt: "Say 'test' if you can read this.",
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
