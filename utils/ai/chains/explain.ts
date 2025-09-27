// utils/ai/chains/explain.ts
import { Gemini } from "../model";
import { explainMoviePrompt } from "../prompts";

interface ExplainInput {
  movieTitle: string;
  movieContext: string; // stringified JSON from TMDB or Supabase
}

export async function explainMovieChain({
  movieTitle,
  movieContext,
}: ExplainInput) {
  const prompt = explainMoviePrompt
    .replace("{{movieTitle}}", movieTitle)
    .replace("{{movieContext}}", movieContext);

  const response = await Gemini.invoke(prompt);

  return response;
}
