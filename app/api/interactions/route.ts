import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const body = await req.json();

        const { user_id, movie_id, action, rating } = body;

        if (!user_id || !movie_id || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (action === 'favorited') {
            const { data: existing } = await supabase
                .from("user_movie_interactions")
                .select("*")
                .eq("user_id", user_id)
                .eq("movie_id", movie_id)
                .maybeSingle();

            if (existing) {
                await supabase.from("user_movie_interactions").delete().eq("id", existing.id);
                return NextResponse.json({ message: "Unliked" }, { status: 200 });
            }
        }

        const { error } = await supabase.from("user_movie_interactions").insert([{
            user_id,
            movie_id,
            action,
            rating
        }]);

        if (error) throw error;

        return NextResponse.json({ message: "Interaction recorded" }, { status: 200 });

    } catch (error: any) {
        console.error("Error recording interaction:", error);
        return NextResponse.json({ error: "Failed to record interaction: " + error.message }, { status: 500 });
    }
}