import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const interactionSchema = z.object({
    media_type: z.enum(["movie", "tv"]),
    media_id: z.number().int().positive(),
    action: z.enum(["favorited", "unfavorited"]),
    rating: z.number().min(0).max(10).optional(),
}).strict();

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const parsed = interactionSchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid interaction request" }, { status: 400 });
        }

        const { media_type, media_id, action, rating } = parsed.data;

        if (action === "favorited") {
            const { error } = await supabase
                .from("user_media_interactions")
                .upsert({
                    user_id: user.id,
                    media_type,
                    media_id,
                    action: "favorited",
                    rating
                }, { onConflict: "user_id,media_type,media_id,action" });

            if (error) throw error;
            return NextResponse.json({ message: "Media favorited" }, { status: 200 });

        } else if (action === "unfavorited") {
            const { error } = await supabase
                .from("user_media_interactions")
                .delete()
                .eq('user_id', user.id)
                .eq('media_type', media_type)
                .eq('media_id', media_id)
                .eq('action', 'favorited');

            if (error) throw error;
            return NextResponse.json({ message: "Media unfavorited" }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid interaction request" }, { status: 400 });

    }
    catch (error: unknown) {
        console.error("Error recording interaction:", error);
        return NextResponse.json({ error: "Failed to record interaction" }, { status: 500 });
    }
}
