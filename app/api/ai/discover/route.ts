import { NextResponse } from "next/server";
import { tmdbServer } from "@/utils/tmdb/server";
import { Provider } from "@/types/types";

type AiFilters = Record<string, string>;

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

const RUNTIME_HINTS: Array<[RegExp, string]> = [
  [/under\s+(\d+)\s*(minutes|min|m|hours|hrs|h)?/i, "lte"],
  [/less than\s+(\d+)\s*(minutes|min|m|hours|hrs|h)?/i, "lte"],
  [/over\s+(\d+)\s*(minutes|min|m|hours|hrs|h)?/i, "gte"],
  [/more than\s+(\d+)\s*(minutes|min|m|hours|hrs|h)?/i, "gte"],
];

function normalizeRuntime(value: string, unit?: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  if (unit && /h|hour|hrs/i.test(unit)) return String(number * 60);
  return String(number);
}

function findProviderId(message: string, providers: Provider[]) {
  const lower = message.toLowerCase();

  for (const [canonical, aliases] of Object.entries(PROVIDER_ALIASES)) {
    if (!aliases.some((alias) => lower.includes(alias))) continue;

    const match = providers.find((provider) =>
      provider.provider_name.toLowerCase().includes(canonical)
    );

    if (match) return String(match.provider_id);
  }

  return "";
}

function inferFilters(message: string, providers: Provider[], region: string): AiFilters {
  const lower = message.toLowerCase();
  const filters: AiFilters = {
    page: "1",
    sort_by: "popularity.desc",
    watch_region: region,
    "vote_count.gte": "100",
  };

  const genres = Object.entries(GENRE_HINTS)
    .filter(([name]) => lower.includes(name))
    .map(([, id]) => id);

  if (genres.length > 0) filters.with_genres = [...new Set(genres)].join("|");

  for (const [pattern, direction] of RUNTIME_HINTS) {
    const match = lower.match(pattern);
    if (match) {
      filters[`with_runtime.${direction}`] = normalizeRuntime(match[1], match[2]);
      break;
    }
  }

  const year = lower.match(/\b(19\d{2}|20\d{2})\b/);
  if (year) filters.year = year[1];

  if (lower.includes("highly rated") || lower.includes("best rated")) {
    filters.sort_by = "vote_average.desc";
    filters["vote_count.gte"] = "300";
    filters["vote_average.gte"] = "7";
  }

  if (lower.includes("hidden gem") || lower.includes("underrated")) {
    filters.sort_by = "vote_average.desc";
    filters["vote_count.gte"] = "50";
    filters["vote_average.gte"] = "7";
  }

  const providerId = findProviderId(message, providers);
  if (providerId) {
    filters.with_watch_providers = providerId;
    filters.with_watch_monetization_types = "flatrate";
  }

  return filters;
}

async function askGeminiForFilters(message: string, region: string, providers: Provider[]) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  const providerHints = providers
    .slice(0, 30)
    .map((provider) => `${provider.provider_name}:${provider.provider_id}`)
    .join(", ");

  const prompt = `Convert this movie discovery request into compact JSON only.
Request: ${message}
Default region: ${region}
Provider ids: ${providerHints}
Allowed filter keys: sort_by, with_genres, year, vote_average.gte, vote_count.gte, with_runtime.gte, with_runtime.lte, watch_region, with_watch_providers, with_watch_monetization_types.
Return shape: {"answer":"short helpful explanation","filters":{...},"followUps":["...","..."]}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      answer?: string;
      filters?: AiFilters;
      followUps?: string[];
    };
  } catch {
    return null;
  }
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
    const ai = await askGeminiForFilters(message, region, providers);
    const filters = {
      ...inferFilters(message, providers, region),
      ...(ai?.filters || {}),
      page: "1",
      watch_region: region,
    };

    const params = new URLSearchParams(filters);
    const movies = await tmdbServer.discoverMovies(params);

    return NextResponse.json({
      answer:
        ai?.answer ||
        "I matched your request to TMDB discovery filters and pulled movies that should fit.",
      filters,
      movies: movies.results || [],
      total_pages: movies.total_pages,
      total_results: movies.total_results,
      followUps: ai?.followUps || [
        "Show me lighter options",
        "Only show highly rated movies",
        "Find hidden gems like these",
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run AI discovery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
