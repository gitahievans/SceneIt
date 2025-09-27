// utils/ai/model.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Factory to create a Gemini (Google Generative) model instance wrapped by LangChain.
 *
 * NOTE:
 *  - This file is intended to be used server-side only (Next.js server components / API routes / server actions).
 *  - Do NOT import this file inside client components (it will leak the API usage).
 */

export function createGeminiModel(options?: {
  modelName?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY not set. Add your Gemini API key to environment variables."
    );
  }

  const modelName = options?.modelName ?? process.env.GEMINI_MODEL ?? "gemini-pro";
  const temperature =
    options?.temperature ??
    (process.env.GEMINI_TEMPERATURE ? Number(process.env.GEMINI_TEMPERATURE) : 0.2);
  const maxOutputTokens = options?.maxOutputTokens ?? 1024;

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: modelName,
    temperature,
    maxOutputTokens,
    // Optionally you can enable streaming callbacks here later.
  });
}

/**
 * Convenience default instance with sensible defaults.
 * Use sparingly (or call createGeminiModel() explicitly to customize).
 */
export const Gemini = createGeminiModel();
