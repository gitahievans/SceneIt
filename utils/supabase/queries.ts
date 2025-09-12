import { createClient } from "@/utils/supabase/client";

export async function getUserInterests(userId: string) {
  const supabase = createClient();

  const { data, error } = await (await supabase)
    .from("user_interests")
    .select("genre_id")
    .eq("user_id", userId);

  if (error) throw error;

  return data.map((row) => row.genre_id);
}

export async function getUserLikes(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_movie_interactions")
    .select("movie_id")
    .eq("user_id", userId)
    .eq("action", "favorited");

  if (error) {
    console.error("Error fetching likes:", error);
    return [];
  }

  return data.map((row) => row.movie_id);
}