import { NextResponse } from "next/server";
import { tmdbServer } from "@/utils/tmdb/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region") || "US";
    const data = await tmdbServer.movieProviders(region);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch providers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
