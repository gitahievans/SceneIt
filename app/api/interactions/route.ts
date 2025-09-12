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

        if (action === "favorited") {
            await supabase
                .from("user_movie_interactions")
                .delete()
                .eq('user_id', user_id)
                .eq('movie_id', movie_id)
                .eq('action', 'favorited');

            const { error } = await supabase
                .from("user_movie_interactions")
                .insert([{
                    user_id,
                    movie_id,
                    action: "favorited",
                    rating
                }]);

            if (error) throw error;
            return NextResponse.json({ message: "Movie favorited" }, { status: 200 });

        } else if (action === "unfavorited") {
            const { error } = await supabase
                .from("user_movie_interactions")
                .delete()
                .eq('user_id', user_id)
                .eq('movie_id', movie_id)
                .eq('action', 'favorited');

            if (error) throw error;
            return NextResponse.json({ message: "Movie unfavorited" }, { status: 200 });
        }


        const { error } = await supabase.from("user_movie_interactions").insert([{
            user_id,
            movie_id,
            action,
            rating
        }]);

        if (error) throw error;

        return NextResponse.json({ message: "Interaction recorded" }, { status: 200 });

    }
    catch (error: unknown) {
        let message = "Failed to record interaction";
        if (error instanceof Error) {
            message += ": " + error.message;
        }
        console.error("Error recording interaction:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}