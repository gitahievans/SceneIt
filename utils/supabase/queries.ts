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

export async function getUserSearches(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_searches")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching searches:", error);
    return [];
  }

  return data;
}


export async function logUserSearch(
  userId: string | undefined,
  query: string,
  movieId?: number | null,
  genreIds?: number[] | null,
  clicked?: boolean) {
  const supabase = createClient();

  const { error } = await supabase.from('user_searches').insert([
    {
      user_id: userId,
      query,
      movie_id: movieId ?? null,
      genre_ids: genreIds ?? null,
      clicked
    }
  ])

  if (error) {
    console.error("Error logging search:", error);
    return;
  }
}