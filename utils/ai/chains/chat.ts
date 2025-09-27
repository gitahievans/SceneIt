// utils/ai/chains/chat.ts
import { Gemini } from "../model";
import { generalQAPrompt } from "../prompts";

interface ChatInput {
  context: string; // stringified data (user interests, movie metadata)
  question: string;
}

export async function chatChain({ context, question }: ChatInput) {
  const prompt = generalQAPrompt
    .replace("{{context}}", context)
    .replace("{{question}}", question);

  const response = await Gemini.invoke(prompt);

  return response;
}
