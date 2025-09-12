import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    const { data: { user } } = await (await supabase).auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const { user_id, genres } = await req.json();

    if (!user_id || !Array.isArray(genres)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Clean old interests (so user can reselect)
    await (await supabase).from("user_interests").delete().eq("user_id", user_id);

    // Insert new ones
    const { error } = await (await supabase).from("user_interests").insert(
      genres.map((g: number) => ({
        user_id,
        genre_id: g,
      }))
    );

    if (error) throw error;

    return NextResponse.json({ message: "Interests saved successfully" });
  } catch (err: unknown) {
    let message = "Failed to save interests";
    if (err instanceof Error) {
      message += ": " + err.message;
    }
    console.error("Error saving interests:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createClient();

    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id") as string;

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    const { data, error } = await (await supabase)
      .from("user_interests")
      .select("genre_id")
      .eq("user_id", user_id);

    if (error) throw error;

    return NextResponse.json({ interests: data.map((d) => d.genre_id) });
  } catch (err: unknown) {
    let message = "Failed to get interests";
    if (err instanceof Error) {
      message += ": " + err.message;
    }
    console.error("Error getting interests:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
