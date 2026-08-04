import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const statusSchema = z.object({
    media_type: z.enum(["movie", "tv"]),
    media_id: z.coerce.number().int().positive(),
    action: z.literal("favorited"),
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const parsed = statusSchema.safeParse(Object.fromEntries(searchParams));
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid interaction parameters" }, { status: 400 });
        }
        const { media_type, media_id, action } = parsed.data;
        
        const { data, error } = await supabase
            .from("user_media_interactions")
            .select("id")
            .eq('user_id', user.id)
            .eq('media_type', media_type)
            .eq('media_id', media_id)
            .eq('action', action)
            .maybeSingle();

        if (error) throw error;

        return NextResponse.json({ exists: !!data }, { status: 200 });

    } catch (error: unknown) {
        console.error("Error checking interaction:", error);
        return NextResponse.json({ error: "Failed to check interaction" }, { status: 500 });
    }
}
