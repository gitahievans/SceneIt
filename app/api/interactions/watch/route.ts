import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const watchSchema = z.object({ movie_id: z.number().int().positive() }).strict();

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const parsed = watchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid watch request" }, { status: 400 });
    }
    const { error } = await supabase.from("user_movie_interactions").insert({
      user_id: user.id,
      movie_id: parsed.data.movie_id,
      action: "watched",
    });
    if (error) throw error;
    return NextResponse.json({ message: "Watch recorded" });
  } catch (error) {
    console.error("Error recording watch:", error);
    return NextResponse.json({ error: "Failed to record watch" }, { status: 500 });
  }
}
