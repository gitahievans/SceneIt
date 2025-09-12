import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get('user_id');
        const movie_id = searchParams.get('movie_id');
        const action = searchParams.get('action');

        if (!user_id || !movie_id || !action) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from("user_movie_interactions")
            .select("*")
            .eq('user_id', user_id)
            .eq('movie_id', movie_id)
            .eq('action', action)
            .single();

        if (error && error.code !== 'PGRST116') { 
            throw error;
        }

        return NextResponse.json({ exists: !!data }, { status: 200 });

    } catch (error: any) {
        console.error("Error checking interaction:", error);
        return NextResponse.json({ 
            error: "Failed to check interaction: " + error.message 
        }, { status: 500 });
    }
}