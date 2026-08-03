import { NextResponse } from "next/server";
import { tmdbServer } from "@/utils/tmdb/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") === "tv" ? "tv" : "movie";
  const id = searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
  try {
    const details = await tmdbServer.details(kind, id);
    const videos = details?.videos?.results || [];
    const trailer = videos.find((video: any) => video.site === "YouTube" && video.type === "Trailer" && video.official)
      || videos.find((video: any) => video.site === "YouTube" && video.type === "Trailer");
    return NextResponse.json({ trailerKey: trailer?.key || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Trailer unavailable" }, { status: 502 });
  }
}
