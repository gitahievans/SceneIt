import { NextResponse } from "next/server";
import { tmdbServer } from "@/utils/tmdb/server";

export async function GET() {
  try {
    const data = await tmdbServer.genres();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch genres";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
