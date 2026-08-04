import MediaImage from "@/components/Common/MediaImage";
import type { TvEpisodeListItem } from "@/types/types";

const airDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatAirDate(value: string | null) {
  if (!value) return "Air date unavailable";
  return airDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export default function EpisodeCard({ episode }: { episode: TvEpisodeListItem }) {
  const episodeLabel = `S${episode.seasonNumber} E${episode.episodeNumber}`;
  return (
    <article className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-[minmax(220px,320px)_1fr]">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-900">
        <MediaImage
          path={episode.stillPath}
          kind="backdrop"
          size="w780"
          fallback="backdrop"
          fallbackLabel={`${episodeLabel} still unavailable`}
          alt={episode.stillPath ? `${episode.name} episode still` : ""}
          fill
          loading="lazy"
          sizes="(max-width: 640px) calc(100vw - 64px), 320px"
          className="object-cover"
        />
      </div>
      <div className="self-center">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <span>{episodeLabel}</span>
          <span aria-hidden="true">·</span>
          {episode.airDate ? <time dateTime={episode.airDate}>{formatAirDate(episode.airDate)}</time> : <span>Air date unavailable</span>}
          {episode.runtime ? <><span aria-hidden="true">·</span><span>{episode.runtime} min</span></> : null}
          {!episode.aired && <span className="rounded-full border border-amber-400/50 px-2 py-0.5 text-xs font-semibold text-amber-300">Unaired</span>}
        </div>
        <h3 className="mt-2 text-xl font-semibold text-white">{episode.name}</h3>
        <p className="mt-2 leading-7 text-gray-300">{episode.overview}</p>
        {episode.rating ? <p className="mt-3 text-sm text-gray-400">TMDB {episode.rating.toFixed(1)}/10{episode.voteCount ? ` from ${episode.voteCount.toLocaleString("en-US")} votes` : ""}</p> : null}
      </div>
    </article>
  );
}
