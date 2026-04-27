import { NextResponse } from "next/server";
import { enrichMoviesWithRuntime, tmdbServer } from "@/utils/tmdb/server";
import { MovieItem, Provider } from "@/types/types";

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
  };
  labels: string[];
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
      plan.constraints.runtimeMin !== undefined ||
      plan.constraints.runtimeMax !== undefined ||
      plan.constraints.ratingMin !== undefined ||
      plan.constraints.ratingMax !== undefined
  );

  return hasNarrowConstraints ? 3 : 1;
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

function createPlan(message: string, providers: Provider[], region: string): SearchPlan {
  const lower = message.toLowerCase();
  const provider = findProvider(message, providers);
  const rating = parseRating(message);
  const years = parseYears(message);
  const runtime = parseRuntime(message);
  const genres = Object.entries(GENRE_HINTS)
    .filter(([name]) => lower.includes(name))
    .map(([, id]) => id);

  const hasStructuredFilters = Boolean(
    provider ||
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
    filters.with_genres = [...new Set(genres)].join("|");
    labels.push(`Genres: ${genres.length} selected`);
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
      genres: [...new Set(genres)],
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || "").trim();
    const region = String(body.region || "US").toUpperCase();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const providers = (await tmdbServer.movieProviders(region)).results || [];
    const plan = createPlan(message, providers, region);

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
