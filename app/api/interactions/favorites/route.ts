import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { FavoriteReference } from "@/types/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_media_interactions")
      .select("media_type, media_id")
      .eq("user_id", user.id)
      .eq("action", "favorited")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const favorites: FavoriteReference[] = (data || []).map((row) => ({
      mediaType: row.media_type,
      mediaId: Number(row.media_id),
    }));
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Error loading favorites:", error);
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 });
  }
}
