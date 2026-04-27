import { NextResponse } from "next/server";
import { enrichMoviesWithRuntime, tmdbServer } from "@/utils/tmdb/server";
import { MovieItem, Provider } from "@/types/types";
import moodConfig from "./mood-config.json";

type AiFilters = Record<string, string>;

type SearchPlan = {
  mode: "title" | "discover";
  title?: string;
  filters: AiFilters;
  constraints: {
    ratingMin?: number;
    ratingMax?: number;
    runtimeMin?: number;
    runtimeMax?: number;
    yearMin?: number;
    yearMax?: number;
    providerId?: string;
    providerName?: string;
    genres?: number[];
    keywordIds?: number[];
    moodLabel?: string;
  };
  labels: string[];
};

type ExplanationPlan = {
  mode: "explain";
  mediaType: "movie" | "tv" | "unknown";
  title: string;
  seasonNumber?: number;
  episodeNumber?: number;
  focus: "recap" | "ending" | "summary" | "specific";
  labels: string[];
};

type TvSearchResult = {
  id: number;
  name: string;
  overview: string;
  first_air_date?: string;
  popularity?: number;
};

type MovieDetails = MovieItem & {
  tagline?: string;
  runtime?: number | null;
};

type TvDetails = {
  id: number;
  name: string;
  overview: string;
  first_air_date?: string;
  number_of_seasons?: number;
  seasons?: Array<{ season_number: number; name: string; overview?: string; episode_count?: number }>;
};

type TvSeason = {
  id: number;
  name: string;
  overview?: string;
  season_number: number;
  episodes?: Array<{ episode_number: number; name: string; overview: string; air_date?: string }>;
};

const PROVIDER_ALIASES: Record<string, string[]> = {
  netflix: ["netflix"],
  "apple tv": ["apple tv", "apple tv plus", "apple tv+"],
  max: ["max", "hbo", "hbo max"],
  "prime video": ["prime video", "amazon prime", "amazon"],
  "disney plus": ["disney plus", "disney+"],
  hulu: ["hulu"],
  peacock: ["peacock"],
  paramount: ["paramount", "paramount plus", "paramount+"],
};

const GENRE_HINTS: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "science fiction": 878,
  "sci-fi": 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

type MoodHint = {
  label: string;
  triggers: string[];
  genres: number[];
  keywords: string[];
};

const MOOD_HINTS = moodConfig as MoodHint[];

const STOP_WORDS = [
  "give",
  "show",
  "find",
  "me",
  "movie",
  "movies",
  "film",
  "films",
  "please",
  "recommend",
  "recommendation",
  "recommendations",
  "watch",
  "rated",
  "rating",
];

const EXPLANATION_PATTERNS = [
  /what happens/i,
  /what happened/i,
  /how did .* end/i,
  /ending/i,
  /recap/i,
  /summari[sz]e/i,
  /breakdown/i,
  /explain/i,
  /who killed/i,
  /why did/i,
  /season\s+\d+/i,
  /episode\s+\d+/i,
  /part\s+(one|two|1|2|i|ii)/i,
];

function normalizeRuntime(value: string, unit?: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  if (unit && /^(h|hr|hrs|hour|hours)$/i.test(unit)) return number * 60;
  return number;
}

function findProvider(message: string, providers: Provider[]) {
  const lower = message.toLowerCase();

  for (const [canonical, aliases] of Object.entries(PROVIDER_ALIASES)) {
    if (!aliases.some((alias) => lower.includes(alias))) continue;

    const match = providers.find((provider) =>
      provider.provider_name.toLowerCase().includes(canonical)
    );

    if (match) return match;
  }

  return providers.find((provider) => lower.includes(provider.provider_name.toLowerCase()));
}

function findMood(message: string) {
  const lower = message.toLowerCase();
  return MOOD_HINTS.find((mood) => mood.triggers.some((trigger) => lower.includes(trigger)));
}

function isExplanationRequest(message: string) {
  return EXPLANATION_PATTERNS.some((pattern) => pattern.test(message));
}

function parseNumberWord(value?: string) {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === "one" || normalized === "i") return 1;
  if (normalized === "two" || normalized === "ii") return 2;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}

function cleanExplanationTitle(message: string) {
  let title = message
    .replace(/\?/g, "")
    .replace(/what happens in/i, "")
    .replace(/what happened in/i, "")
    .replace(/how did/i, "")
    .replace(/end$/i, "")
    .replace(/recap/i, "")
    .replace(/summari[sz]e/i, "")
    .replace(/explain/i, "")
    .replace(/ending/i, "")
    .replace(/breakdown/i, "")
    .replace(/season\s+\d+/i, "")
    .replace(/episode\s+\d+/i, "")
    .replace(/part\s+(one|two|1|2|i|ii)/i, "")
    .replace(/\bof\b/gi, "")
    .replace(/\bin\b/gi, "")
    .trim();

  title = title.replace(/\s+/g, " ");
  title = title.replace(/^(the|a|an)\s+/i, "");
  return title || message.trim();
}

function createExplanationPlan(message: string): ExplanationPlan | null {
  if (!isExplanationRequest(message)) return null;

  const lower = message.toLowerCase();
  const seasonMatch = lower.match(/season\s+(\d+)/);
  const episodeMatch = lower.match(/episode\s+(\d+)/);
  const partMatch = lower.match(/part\s+(one|two|1|2|i|ii)/);
  const seasonNumber = seasonMatch ? Number(seasonMatch[1]) : parseNumberWord(partMatch?.[1]);
  const episodeNumber = episodeMatch ? Number(episodeMatch[1]) : undefined;
  const focus = /end|ending/i.test(message)
    ? "ending"
    : /recap|what happened|what happens|before/i.test(message)
      ? "recap"
      : /why|who|specific/i.test(message)
        ? "specific"
        : "summary";
  const title = cleanExplanationTitle(message);

  return {
    mode: "explain",
    mediaType: seasonNumber || episodeNumber ? "tv" : "unknown",
    title,
    seasonNumber,
    episodeNumber,
    focus,
    labels: [
      `Mode: Explanation`,
      `Title: ${title}`,
      seasonNumber ? `Season: ${seasonNumber}` : "",
      episodeNumber ? `Episode: ${episodeNumber}` : "",
      `Focus: ${focus}`,
    ].filter(Boolean),
  };
}

async function resolveKeywordIds(keywords: string[]) {
  const results = await Promise.all(
    keywords.map(async (keyword) => {
      try {
        const data = await tmdbServer.searchKeyword(keyword);
        const exact = data.results.find((item) => item.name.toLowerCase() === keyword.toLowerCase());
        return exact?.id || data.results[0]?.id || null;
      } catch {
        return null;
      }
    })
  );

  return [...new Set(results.filter((id): id is number => typeof id === "number"))];
}

function parseRating(message: string) {
  const lower = message.toLowerCase();
  const followedByRuntimeUnit = (match: RegExpMatchArray | null) =>
    Boolean(match?.[2] && /^(h|hr|hrs|hour|hours|m|min|minute|minutes)$/i.test(match[2]));

  const between = lower.match(/(?:rated|rating|ratings)?\s*(?:between|from)?\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)/);
  if (between) {
    return {
      min: Math.min(Number(between[1]), Number(between[2])),
      max: Math.max(Number(between[1]), Number(between[2])),
    };
  }

  const above = lower.match(/(?:rated|rating|ratings)?.*?(?:above|over|greater than|at least)\s*(\d+(?:\.\d+)?)(?:\s*(h|hr|hrs|hour|hours|m|min|minute|minutes))?/);
  if (above && !followedByRuntimeUnit(above)) return { min: Number(above[1]) };

  const below = lower.match(/(?:rated|rating|ratings)?.*?(?:below|under|less than|at most)\s*(\d+(?:\.\d+)?)(?:\s*(h|hr|hrs|hour|hours|m|min|minute|minutes))?/);
  if (below && !followedByRuntimeUnit(below)) return { max: Number(below[1]) };

  const exact = lower.match(/(?:rated|rating|ratings)\s*(?:exactly|of)?\s*(\d+(?:\.\d+)?)/);
  if (exact) return { min: Number(exact[1]), max: Number(exact[1]) };

  return {};
}

function parseYears(message: string) {
  const lower = message.toLowerCase();
  const between = lower.match(/(?:between|from)\s*(19\d{2}|20\d{2})\s*(?:and|to|-)\s*(19\d{2}|20\d{2})/);
  if (between) {
    return {
      min: Math.min(Number(between[1]), Number(between[2])),
      max: Math.max(Number(between[1]), Number(between[2])),
    };
  }

  const onwards = lower.match(/(?:from|since)\s*(19\d{2}|20\d{2})\s*(?:onwards| onward| and later| or later)?/);
  if (onwards) return { min: Number(onwards[1]) };

  const after = lower.match(/(?:after|later than)\s*(19\d{2}|20\d{2})/);
  if (after) return { min: Number(after[1]) + 1 };

  const before = lower.match(/(?:before|earlier than)\s*(19\d{2}|20\d{2})/);
  if (before) return { max: Number(before[1]) - 1 };

  const exact = lower.match(/\b(19\d{2}|20\d{2})\b/);
  if (exact) return { min: Number(exact[1]), max: Number(exact[1]) };

  return {};
}

function parseRuntime(message: string) {
  const lower = message.toLowerCase();
  const between = lower.match(/(?:between|from)\s*(\d+)\s*(minutes|min|m|hours|hrs|h)?\s*(?:and|to|-)\s*(\d+)\s*(minutes|min|m|hours|hrs|h)?/);
  if (between && /runtime|hour|minute|min|\bm\b|\bh\b/.test(lower)) {
    const min = normalizeRuntime(between[1], between[2]);
    const max = normalizeRuntime(between[3], between[4] || between[2]);
    return { min, max };
  }

  const under = lower.match(/(?:under|less than|at most)\s*(\d+)\s*(minutes|min|m|hours|hrs|h)/);
  if (under) return { max: normalizeRuntime(under[1], under[2]) };

  const over = lower.match(/(?:above|over|more than|at least)\s*(\d+)\s*(minutes|min|m|hours|hrs|h)/);
  if (over) return { min: normalizeRuntime(over[1], over[2]) };

  return {};
}

function inferTitle(message: string, hasStructuredFilters: boolean) {
  const lower = message.toLowerCase();
  const trimmed = message.trim();
  const quoted = message.match(/["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1].trim();

  const like = lower.match(/(?:like|similar to)\s+(.+)$/);
  if (like?.[1]) return like[1].trim();

  const direct = lower.match(/^(?:give|show|find|get)\s+(?:me\s+)?(.+)$/);
  if (!direct?.[1] || hasStructuredFilters) {
    if (!hasStructuredFilters && /^[\p{L}\p{N}:'&.\- ]{2,60}$/u.test(trimmed)) {
      const words = lower.split(/\s+/).filter(Boolean);
      const meaningfulWords = words.filter((word) => !STOP_WORDS.includes(word));
      if (meaningfulWords.length > 0 && meaningfulWords.length <= 4) return trimmed;
    }
    return undefined;
  }

  const cleaned = direct[1]
    .split(/\s+/)
    .filter((word) => !STOP_WORDS.includes(word))
    .join(" ")
    .trim();

  return cleaned || undefined;
}

function pageDepthForPlan(plan: SearchPlan) {
  const hasNarrowConstraints = Boolean(
    plan.constraints.providerId ||
      plan.constraints.moodLabel ||
      plan.constraints.keywordIds?.length ||
      plan.constraints.runtimeMin !== undefined ||
      plan.constraints.runtimeMax !== undefined ||
      plan.constraints.ratingMin !== undefined ||
      plan.constraints.ratingMax !== undefined
  );

  return hasNarrowConstraints ? 4 : 1;
}

async function fetchDiscoverPages(plan: SearchPlan, depth: number) {
  const pages = await Promise.all(
    Array.from({ length: depth }, (_, index) => {
      const params = new URLSearchParams(plan.filters);
      params.set("page", String(index + 1));
      return tmdbServer.discoverMovies(params);
    })
  );

  const [first] = pages;

  return {
    ...first,
    results: pages.flatMap((page) => page.results || []),
  };
}

async function createPlan(message: string, providers: Provider[], region: string): Promise<SearchPlan> {
  const lower = message.toLowerCase();
  const provider = findProvider(message, providers);
  const mood = findMood(message);
  const rating = parseRating(message);
  const years = parseYears(message);
  const runtime = parseRuntime(message);
  const explicitGenres = Object.entries(GENRE_HINTS)
    .filter(([name]) => lower.includes(name))
    .map(([, id]) => id);
  const genres = [...new Set([...explicitGenres, ...(mood?.genres || [])])];
  const keywordIds = mood ? await resolveKeywordIds(mood.keywords) : [];

  const hasStructuredFilters = Boolean(
    provider ||
      mood ||
      rating.min !== undefined ||
      rating.max !== undefined ||
      years.min !== undefined ||
      years.max !== undefined ||
      runtime.min !== undefined ||
      runtime.max !== undefined ||
      genres.length
  );

  const title = inferTitle(message, hasStructuredFilters);
  const filters: AiFilters = {
    page: "1",
    sort_by: rating.min !== undefined || rating.max !== undefined ? "vote_average.desc" : "popularity.desc",
    watch_region: region,
  };
  const labels: string[] = [];

  if (genres.length) {
    filters.with_genres = genres.join("|");
    labels.push(mood ? `Mood: ${mood.label}` : `Genres: ${genres.length} selected`);
  }

  if (keywordIds.length) {
    filters.with_keywords = keywordIds.join("|");
    labels.push(`Themes: ${mood?.keywords.slice(0, 3).join(", ")}`);
  }

  if (rating.min !== undefined) {
    filters["vote_average.gte"] = String(rating.min);
    labels.push(`Rating from ${rating.min}`);
  }
  if (rating.max !== undefined) {
    filters["vote_average.lte"] = String(rating.max);
    labels.push(`Rating up to ${rating.max}`);
  }

  if (runtime.min !== undefined) {
    filters["with_runtime.gte"] = String(runtime.min);
    labels.push(`Runtime from ${runtime.min} min`);
  }
  if (runtime.max !== undefined) {
    filters["with_runtime.lte"] = String(runtime.max);
    labels.push(`Runtime up to ${runtime.max} min`);
  }

  if (years.min !== undefined) {
    filters["primary_release_date.gte"] = `${years.min}-01-01`;
    labels.push(`Released from ${years.min}`);
  }
  if (years.max !== undefined) {
    filters["primary_release_date.lte"] = `${years.max}-12-31`;
    labels.push(`Released through ${years.max}`);
  }

  if (provider) {
    filters.with_watch_providers = String(provider.provider_id);
    filters.with_watch_monetization_types = "flatrate";
    labels.push(`Provider: ${provider.provider_name}`);
  }

  if (title) labels.push(`Title search: ${title}`);
  labels.push(`Region: ${region}`);

  return {
    mode: title ? "title" : "discover",
    title,
    filters,
    constraints: {
      ratingMin: rating.min,
      ratingMax: rating.max,
      runtimeMin: runtime.min,
      runtimeMax: runtime.max,
      yearMin: years.min,
      yearMax: years.max,
      providerId: provider ? String(provider.provider_id) : undefined,
      providerName: provider?.provider_name,
      genres,
      keywordIds,
      moodLabel: mood?.label,
    },
    labels,
  };
}

function movieYear(movie: MovieItem) {
  return movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
}

async function movieHasProvider(movieId: number, providerId: string, region: string) {
  try {
    const data = await tmdbServer.movieWatchProviders(String(movieId));
    const options = data.results?.[region];
    const providers = [
      ...(options?.flatrate || []),
      ...(options?.free || []),
      ...(options?.ads || []),
      ...(options?.rent || []),
      ...(options?.buy || []),
    ];
    return providers.some((provider) => String(provider.provider_id) === providerId);
  } catch {
    return false;
  }
}

async function enforcePlan(movies: MovieItem[], plan: SearchPlan, region: string) {
  const filtered: MovieItem[] = [];

  for (const movie of movies) {
    const year = movieYear(movie);

    if (plan.constraints.ratingMin !== undefined && movie.vote_average < plan.constraints.ratingMin) continue;
    if (plan.constraints.ratingMax !== undefined && movie.vote_average > plan.constraints.ratingMax) continue;
    if (plan.constraints.runtimeMin !== undefined && (!movie.runtime || movie.runtime < plan.constraints.runtimeMin)) continue;
    if (plan.constraints.runtimeMax !== undefined && (!movie.runtime || movie.runtime > plan.constraints.runtimeMax)) continue;
    if (plan.constraints.yearMin !== undefined && (!year || year < plan.constraints.yearMin)) continue;
    if (plan.constraints.yearMax !== undefined && (!year || year > plan.constraints.yearMax)) continue;
    if (
      plan.constraints.genres?.length &&
      !plan.constraints.genres.some((genreId) => movie.genre_ids?.includes(genreId))
    ) {
      continue;
    }
    if (
      plan.constraints.providerId &&
      !(await movieHasProvider(movie.id, plan.constraints.providerId, region))
    ) {
      continue;
    }

    filtered.push(movie);
  }

  return filtered;
}

function rankTitleResults(movies: MovieItem[], title: string) {
  const query = title.toLowerCase();
  return [...movies].sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aScore = aTitle === query ? 3 : aTitle.startsWith(query) ? 2 : aTitle.includes(query) ? 1 : 0;
    const bScore = bTitle === query ? 3 : bTitle.startsWith(query) ? 2 : bTitle.includes(query) ? 1 : 0;
    return bScore - aScore || (b.popularity || 0) - (a.popularity || 0);
  });
}

function answerFor(plan: SearchPlan, count: number) {
  if (count === 0) {
    return `I could not find movies that match every constraint: ${plan.labels.join(", ")}. Try widening one filter.`;
  }

  if (plan.mode === "title") {
    return `I searched by title and ranked the closest matches first. Applied: ${plan.labels.join(", ")}.`;
  }

  return `I applied your constraints strictly and returned ${count} matching movie${count === 1 ? "" : "s"}.`;
}

function rankTvResults(results: TvSearchResult[], title: string) {
  const query = title.toLowerCase();
  return [...results].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aScore = aName === query ? 3 : aName.startsWith(query) ? 2 : aName.includes(query) ? 1 : 0;
    const bScore = bName === query ? 3 : bName.startsWith(query) ? 2 : bName.includes(query) ? 1 : 0;
    return bScore - aScore || (b.popularity || 0) - (a.popularity || 0);
  });
}

async function buildExplanationContext(plan: ExplanationPlan) {
  const [tvSearch, movieSearch] = await Promise.all([
    tmdbServer.searchTv(plan.title, "1").catch(() => ({ results: [] as TvSearchResult[] })),
    tmdbServer.searchMovies(plan.title, "1").catch(() => ({ results: [] })),
  ]);

  const tvMatch = rankTvResults(tvSearch.results || [], plan.title)[0];
  const movieMatch = rankTitleResults(movieSearch.results || [], plan.title)[0];
  const useTv = plan.mediaType === "tv" || Boolean(plan.seasonNumber || plan.episodeNumber) || Boolean(tvMatch && !movieMatch);

  if (useTv && tvMatch) {
    const details = await tmdbServer.tvDetails(String(tvMatch.id)) as TvDetails;
    const seasonNumber = plan.seasonNumber || 1;
    const season = await tmdbServer.tvSeason(String(tvMatch.id), seasonNumber).catch(() => null) as TvSeason | null;
    const episode = plan.episodeNumber && season
      ? await tmdbServer.tvEpisode(String(tvMatch.id), seasonNumber, plan.episodeNumber).catch(() => null)
      : null;

    return {
      mediaType: "tv" as const,
      matchedTitle: details.name || tvMatch.name,
      details,
      season,
      episode,
      sourceText: [
        `TV Show: ${details.name}`,
        `Show overview: ${details.overview || "N/A"}`,
        season ? `Season ${season.season_number}: ${season.name}` : "",
        season?.overview ? `Season overview: ${season.overview}` : "",
        episode ? `Episode ${plan.episodeNumber}: ${(episode as { name?: string }).name || ""}` : "",
        episode ? `Episode overview: ${(episode as { overview?: string }).overview || "N/A"}` : "",
        season?.episodes?.length
          ? `Episode summaries:\n${season.episodes
              .map((item) => `${item.episode_number}. ${item.name}: ${item.overview || "No overview."}`)
              .join("\n")}`
          : "",
      ].filter(Boolean).join("\n\n"),
    };
  }

  if (movieMatch) {
    const details = await tmdbServer.movieDetails(String(movieMatch.id)) as MovieDetails;
    return {
      mediaType: "movie" as const,
      matchedTitle: details.title || movieMatch.title,
      details,
      sourceText: [
        `Movie: ${details.title}`,
        details.release_date ? `Release date: ${details.release_date}` : "",
        details.runtime ? `Runtime: ${details.runtime} minutes` : "",
        details.tagline ? `Tagline: ${details.tagline}` : "",
        `Overview: ${details.overview || "N/A"}`,
      ].filter(Boolean).join("\n\n"),
    };
  }

  return null;
}

async function generateExplanation(message: string, plan: ExplanationPlan, sourceText: string) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return `I found relevant TMDB metadata, but GEMINI_API_KEY is not configured, so I can only show the source summary:\n\n${sourceText}`;
  }

  const prompt = `You are SceneIt AI. Answer the user's movie/TV explanation question in clear, readable prose.
User question: ${message}
Focus: ${plan.focus}
Use this TMDB metadata as grounding. If the metadata is thin, say so briefly and avoid inventing exact scene details.
Spoilers are allowed because the user asked for what happens.

TMDB metadata:
${sourceText}

Write a helpful recap/explanation with headings when useful. Do not recommend other titles unless asked.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.35, maxOutputTokens: 1400 },
      }),
    }
  );

  if (!response.ok) {
    return `I found the title, but could not generate the full recap right now. Here is the TMDB source summary:\n\n${sourceText}`;
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    `I found the title, but could not generate the full recap right now. Here is the TMDB source summary:\n\n${sourceText}`;
}

async function handleExplanation(message: string, plan: ExplanationPlan) {
  const context = await buildExplanationContext(plan);

  if (!context) {
    return NextResponse.json({
      mode: "explain",
      answer: `I could not confidently match "${plan.title}" to a movie or TV show on TMDB.`,
      plan,
      movies: [],
    });
  }

  const answer = await generateExplanation(message, plan, context.sourceText);

  return NextResponse.json({
    mode: "explain",
    answer,
    plan: {
      ...plan,
      mediaType: context.mediaType,
      matchedTitle: context.matchedTitle,
      labels: [
        ...plan.labels,
        `Matched: ${context.matchedTitle}`,
        `Source: TMDB metadata + AI synthesis`,
      ],
    },
    movies: [],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || "").trim();
    const region = String(body.region || "US").toUpperCase();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const explanationPlan = createExplanationPlan(message);
    if (explanationPlan) return handleExplanation(message, explanationPlan);

    const providers = (await tmdbServer.movieProviders(region)).results || [];
    const plan = await createPlan(message, providers, region);

    const rawMovies =
      plan.mode === "title" && plan.title
        ? await tmdbServer.searchMovies(plan.title, "1")
        : await fetchDiscoverPages(plan, pageDepthForPlan(plan));

    const enriched = await enrichMoviesWithRuntime(rawMovies);
    const ranked = plan.mode === "title" && plan.title
      ? rankTitleResults(enriched.results || [], plan.title)
      : enriched.results || [];
    const movies = await enforcePlan(ranked, plan, region);

    return NextResponse.json({
      answer: answerFor(plan, movies.length),
      filters: plan.filters,
      plan: {
        mode: plan.mode,
        title: plan.title,
        labels: plan.labels,
      },
      movies,
      total_pages: rawMovies.total_pages,
      total_results: movies.length,
      followUps: [
        "Widen the rating range",
        "Show only recent movies",
        "Find something similar to the first result",
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run AI discovery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
