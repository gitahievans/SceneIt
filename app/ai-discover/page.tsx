"use client";

import MovieGrid from "@/components/Common/MovieGrid";
import { MovieItem } from "@/types/types";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";

type AiDiscoveryResponse = {
  answer: string;
  filters: Record<string, string>;
  plan?: {
    mode: string;
    title?: string;
    labels: string[];
  };
  movies: MovieItem[];
  followUps?: string[];
  total_results?: number;
};

const EXAMPLES = [
  "Find me tense thrillers under 2 hours on Netflix",
  "Recommend highly rated family movies for tonight",
  "Show me underrated sci-fi movies from the 2010s",
];

export default function AiDiscoverPage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AiDiscoveryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (prompt = message) => {
    const value = prompt.trim();
    if (!value || isLoading) return;

    setMessage(value);
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, region: "US" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to discover movies");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
            <Bot size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">SceneIt AI</p>
            <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Ask For Movies, Get Real Cards</h1>
          </div>
        </div>
        <p className="max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Ask naturally for what you want to watch. SceneIt turns your request into discovery filters and returns movies you can inspect, save, or open.
        </p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") ask();
            }}
            placeholder="Ask for a movie mood, provider, runtime, genre, year..."
            className="min-h-12 flex-1 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-orange-950"
          />
          <button
            onClick={() => ask()}
            disabled={!message.trim() || isLoading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Discover
          </button>
        </div>

        {!result && (
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => ask(example)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-700"
              >
                <Sparkles size={14} />
                {example}
              </button>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {(isLoading || result) && (
        <section className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                <Bot size={17} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-950 dark:text-white">Recommendation logic</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {isLoading ? "Matching your request to movie filters..." : result?.answer}
                </p>
                {result?.plan?.labels && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.plan.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {result?.filters && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-medium text-gray-500 dark:text-gray-400">
                      Raw filters
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(result.filters).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>

          <MovieGrid movies={result?.movies || []} isLoading={isLoading} />

          {result?.followUps && (
            <div className="flex flex-wrap gap-2">
              {result.followUps.map((followUp) => (
                <button
                  key={followUp}
                  onClick={() => ask(followUp)}
                  className="rounded-full border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-700"
                >
                  {followUp}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
