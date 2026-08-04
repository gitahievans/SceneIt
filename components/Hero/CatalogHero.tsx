"use client";

import Link from "next/link";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MediaImage from "@/components/Common/MediaImage";
import { useAuth } from "@/components/Common/Providers";
import LikeButton from "@/components/DetailsPage/LikeButton";
import { QueryService } from "@/app/services/queryClient";
import { getUserInterests, getUserLikes, getUserSearches, getUserWatched } from "@/utils/supabase/queries";
import { mediaPath } from "@/utils/seo/site";
import type { ContentKind, HeroCandidate, MovieItem } from "@/types/types";

function candidate(item: MovieItem, kind: ContentKind): HeroCandidate | null {
  if (!item.backdrop_path) return null;
  return {
    kind, id: item.id, title: item.title || item.name || "Untitled", overview: item.overview || "",
    rating: item.vote_average || 0, posterPath: item.poster_path, backdropPath: item.backdrop_path,
  };
}

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function CatalogHero({ kind, trending }: { kind: ContentKind; trending: MovieItem[] }) {
  const { user } = useAuth();
  const initial = useMemo(() => trending.map((item) => candidate(item, kind)).filter(Boolean) as HeroCandidate[], [kind, trending]);
  const [items, setItems] = useState(initial);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const explicitlyPaused = useRef(false);
  const heroRef = useRef<HTMLElement>(null);
  const main = items[0];

  useEffect(() => {
    if (!user) { setItems(shuffled(initial)); return; }
    let active = true;
    (async () => {
      try {
        const [interests, searches] = await Promise.all([getUserInterests(user.id), getUserSearches(user.id)]);
        const genreIds = new Set<number>(interests);
        searches.forEach((search: { genre_ids?: number[] | null }) => search.genre_ids?.forEach((id) => genreIds.add(id)));
        let mappedGenres = [...genreIds];
        if (kind === "tv" && mappedGenres.length) {
          const [movieGenres, tvGenres] = await Promise.all([QueryService.getGenres("movie"), QueryService.getGenres("tv")]);
          const names = new Set(movieGenres.genres.filter((g: { id: number }) => genreIds.has(g.id)).map((g: { name: string }) => g.name));
          mappedGenres = tvGenres.genres.filter((g: { name: string }) => names.has(g.name)).map((g: { id: number }) => g.id);
        }
        const personalized: MovieItem[] = [];
        const searchTerms = [...new Set(searches.map((search: { query?: string }) => search.query).filter(Boolean) as string[])].slice(-3);
        if (searchTerms.length) {
          const searchResults = await Promise.all(searchTerms.map((query) => (kind === "movie" ? QueryService.searchMovies(query) : QueryService.searchTv(query)).catch(() => ({ results: [] }))));
          searchResults.forEach((result) => personalized.push(...(result.results || [])));
        }
        if (mappedGenres.length) {
          const discovery = await QueryService.discover(kind, { with_genres: mappedGenres.slice(0, 5).join("|"), sort_by: "popularity.desc" });
          personalized.push(...(discovery.results || []));
        }
        if (kind === "movie") {
          const [likes, watched] = await Promise.all([getUserLikes(user.id), getUserWatched(user.id)]);
          const details = await Promise.all([...new Set([...likes, ...watched])].slice(0, 6).map((id) => QueryService.getMovieDetails(id).catch(() => null)));
          personalized.unshift(...details.filter(Boolean));
        }
        const merged = [...personalized, ...trending].map((item) => candidate(item, kind)).filter(Boolean) as HeroCandidate[];
        const unique = [...new Map(merged.map((item) => [item.id, item])).values()];
        if (active && unique.length) setItems(shuffled(unique));
      } catch { if (active) setItems(initial); }
    })();
    return () => { active = false; };
  }, [initial, kind, trending, user]);

  useEffect(() => {
    setTrailerKey(null); setPlaying(false); setReadyToPlay(false); explicitlyPaused.current = false;
    if (!main) return;
    fetch(`/api/tmdb/hero?kind=${main.kind}&id=${main.id}`).then((response) => response.ok ? response.json() : null).then((data) => setTrailerKey(data?.trailerKey || null)).catch(() => null);
  }, [main]);

  useEffect(() => {
    const element = heroRef.current;
    if (!element || !trailerKey || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && !document.hidden) {
        timer = setTimeout(() => { setReadyToPlay(true); if (!explicitlyPaused.current) setPlaying(true); }, 2000);
      } else {
        if (timer) clearTimeout(timer);
        setPlaying(false);
      }
    }, { threshold: [0, 0.6, 1] });
    const visibility = () => document.hidden ? setPlaying(false) : !explicitlyPaused.current && setReadyToPlay((ready) => { if (ready) setPlaying(true); return ready; });
    observer.observe(element); document.addEventListener("visibilitychange", visibility);
    return () => { if (timer) clearTimeout(timer); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [trailerKey]);

  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>("#catalog-hero-player");
    iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: playing ? "playVideo" : "pauseVideo", args: [] }), "https://www.youtube-nocookie.com");
  }, [playing]);

  if (!main) return null;
  const togglePlay = () => { setReadyToPlay(true); setPlaying((value) => { explicitlyPaused.current = value; return !value; }); };
  const detail = mediaPath(kind, main.id, main.title);

  return (
    <section ref={heroRef} aria-label={`Featured ${kind === "movie" ? "movies" : "TV shows"}`} className="grid h-[52vh] min-h-[390px] max-h-[560px] gap-3 overflow-hidden lg:grid-cols-[2fr_1fr]">
      <article className="relative overflow-hidden rounded-2xl bg-gray-950 text-white">
        <MediaImage path={main.backdropPath} kind="backdrop" size="w1280" fallback="backdrop" fallbackLabel="Featured backdrop unavailable" fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" alt="" />
        {readyToPlay && trailerKey && <iframe id="catalog-hero-player" className={`absolute inset-0 h-full w-full ${playing ? "opacity-100" : "opacity-0"}`} src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&playsinline=1&enablejsapi=1&loop=1&playlist=${trailerKey}`} title={`${main.title} trailer`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-orange-300">Featured today</p>
          <h2 className="mt-2 text-3xl font-bold md:text-5xl">{main.title}</h2>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-gray-200 md:text-base">{main.overview}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link href={detail} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-950">View details</Link>
            {trailerKey && <button type="button" onClick={togglePlay} aria-label={playing ? "Pause trailer" : "Play trailer"} className="rounded-full bg-black/60 p-2.5">{playing ? <Pause size={18} /> : <Play size={18} />}</button>}
            {trailerKey && <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Unmute trailer" : "Mute trailer"} className="rounded-full bg-black/60 p-2.5">{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>}
            <div className="[&_button]:rounded-full [&_button]:p-2.5 [&_span]:hidden"><LikeButton mediaType={kind} mediaId={main.id} /></div>
          </div>
        </div>
      </article>
      <div className="hidden grid-rows-2 gap-3 lg:grid">
        {items.slice(1, 3).map((item) => <Link key={item.id} href={mediaPath(kind, item.id, item.title)} className="group relative overflow-hidden rounded-2xl bg-gray-900"><MediaImage path={item.backdropPath} kind="backdrop" size="w780" fallback="backdrop" fill sizes="33vw" className="object-cover transition-transform group-hover:scale-105" alt="" /><div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" /><div className="absolute inset-x-0 bottom-0 p-4 text-white"><h3 className="text-lg font-bold">{item.title}</h3><p className="text-sm text-gray-300">TMDB {item.rating.toFixed(1)}/10</p></div></Link>)}
      </div>
    </section>
  );
}
