import { NextResponse } from "next/server";
import { tmdbServer } from "@/utils/tmdb/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await tmdbServer.movieDetails(id);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch movie details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
