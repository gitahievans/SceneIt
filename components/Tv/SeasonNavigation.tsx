import Link from "next/link";
import type { TvSeasonSummary } from "@/types/types";
import { tvSeasonPath } from "@/utils/seo/site";

export default function SeasonNavigation({
  showId,
  showTitle,
  seasons,
  activeSeason,
}: {
  showId: number;
  showTitle: string;
  seasons: TvSeasonSummary[];
  activeSeason: number;
}) {
  const regular = seasons.filter((season) => season.season_number > 0).sort((a, b) => a.season_number - b.season_number);
  const specials = seasons.find((season) => season.season_number === 0);
  const seasonLink = (season: TvSeasonSummary) => (
    <Link
      key={season.id}
      href={tvSeasonPath(showId, showTitle, season.season_number)}
      prefetch={false}
      aria-current={season.season_number === activeSeason ? "page" : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-semibold ${season.season_number === activeSeason ? "border-orange-400 bg-orange-400 text-gray-950" : "border-white/20 text-gray-200 hover:bg-white/10"}`}
    >
      {season.name || `Season ${season.season_number}`}
    </Link>
  );

  return (
    <nav aria-label="Seasons" className="space-y-4">
      <div className="flex flex-wrap gap-2">{regular.map(seasonLink)}</div>
      {specials && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Specials</p>{seasonLink(specials)}</div>}
    </nav>
  );
}
