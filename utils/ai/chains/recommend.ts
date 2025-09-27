// utils/ai/chains/recommend.ts
import { Gemini } from "../model";
import { recommendMoviesPrompt } from "../prompts";

interface RecommendInput {
  userProfile: string;
  availableMovies: string; // JSON or stringified list
}

export async function recommendMoviesChain({
  userProfile,
  availableMovies,
}: RecommendInput) {
  // Fill the template
  const prompt = recommendMoviesPrompt
    .replace("{{userProfile}}", userProfile)
    .replace("{{availableMovies}}", availableMovies);

  const response = await Gemini.invoke(prompt);

  return response; // raw text from Gemini
}
