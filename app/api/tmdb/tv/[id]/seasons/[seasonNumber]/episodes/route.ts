import { tmdbServer } from "@/utils/tmdb/server";
import { findSeason, paginateSeason, parsePositiveInteger, parseSeasonNumber } from "@/utils/tmdb/tv";

type Context = { params: Promise<{ id: string; seasonNumber: string }> };

export async function GET(request: Request, { params }: Context) {
  const { id, seasonNumber: rawSeasonNumber } = await params;
  const seasonNumber = parseSeasonNumber(rawSeasonNumber);
  const page = parsePositiveInteger(new URL(request.url).searchParams.get("page") || "1");

  if (!parsePositiveInteger(id) || seasonNumber === null || page === null) {
    return Response.json({ error: "Invalid show ID, season number, or page" }, { status: 400 });
  }

  try {
    const show = await tmdbServer.tvDetails(id);
    if (!findSeason(show, seasonNumber)) {
      return Response.json({ error: "Season not found" }, { status: 404 });
    }
    const season = await tmdbServer.tvSeason(id, seasonNumber);
    const result = paginateSeason(season, page);
    if (!result) return Response.json({ error: "Episode page not found" }, { status: 404 });
    return Response.json(result, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch {
    return Response.json({ error: "Unable to load episodes from TMDB" }, { status: 502 });
  }
}
