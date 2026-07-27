"use client";

import { useEffect, useState } from "react";
import { Bot, ExternalLink, Loader2, Search, Send, Sparkles } from "lucide-react";
import MovieGrid from "@/components/Common/MovieGrid";
import { MessageResponse } from "@/components/ai-elements/message";
import type { MovieItem } from "@/types/types";

type ConversationMessage = { role: "user" | "assistant"; content: string };
type UsageMetadata = { limit: number; used: number; remaining: number; resetDate?: string };
type DiscoverySource = { title: string; url: string; snippet?: string; source?: string };
type AiDiscoveryResponse = {
  mode: "discover" | "explain" | "research";
  answer: string;
  movies: MovieItem[];
  sources: DiscoverySource[];
  toolActivity: string[];
  followUps: string[];
  total_results: number;
} & Partial<UsageMetadata>;

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: AiDiscoveryResponse;
};

type AiDiscoveryCache = {
  message: string;
  turns: ChatTurn[];
  usage: UsageMetadata | null;
};

const CACHE_KEY = "sceneit:ai-discover:session";
const EXAMPLES = [
  "Find tense thrillers under 2 hours on Netflix",
  "Recommend highly rated family movies I have not watched",
  "What happens in season 2 of Breaking Bad?",
  "Find recent interviews with the director of Dune: Part Two",
];

export default function AiDiscoverPage() {
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [usage, setUsage] = useState<UsageMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem(CACHE_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached) as AiDiscoveryCache;
      if (!Array.isArray(parsed?.turns)) return;
      setMessage(parsed.message || "");
      setTurns(parsed.turns);
      setUsage(parsed.usage || null);
    } catch {
      window.sessionStorage.removeItem(CACHE_KEY);
    }
  }, []);

  const persist = (nextMessage: string, nextTurns: ChatTurn[], nextUsage: UsageMetadata | null) => {
    try {
      window.sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ message: nextMessage, turns: nextTurns, usage: nextUsage } satisfies AiDiscoveryCache)
      );
    } catch {
      // Conversation restore is optional; the request still succeeds without session storage.
    }
  };

  const createTurnId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const getLocalRequestContext = () => {
    const now = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");
    return {
      localDate: `${now.getFullYear()}-${month}-${day}`,
      timeZone,
    };
  };

  const transcriptMessages = (items: ChatTurn[]): ConversationMessage[] =>
    items.map((turn) => ({ role: turn.role, content: turn.content }));

  const usageCopy = usage
    ? `${usage.used} of ${usage.limit} AI messages used today`
    : "10 AI messages available per day";
  const isLimitReached = usage?.remaining === 0;

  const ask = async (prompt = message) => {
    const value = prompt.trim();
    if (!value || isLoading || isLimitReached) return;
    setMessage(value);
    setIsLoading(true);
    setError("");

    const userTurn: ChatTurn = { id: createTurnId(), role: "user", content: value };
    const requestTurns = [...turns, userTurn];
    setTurns(requestTurns);

    try {
      const { localDate, timeZone } = getLocalRequestContext();
      const response = await fetch("/api/ai/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: value,
          region: "US",
          messages: transcriptMessages(turns).slice(-12),
          localDate,
          timeZone,
        }),
      });
      const data = await response.json();
      if (typeof data.limit === "number" && typeof data.used === "number" && typeof data.remaining === "number") {
        setUsage({ limit: data.limit, used: data.used, remaining: data.remaining, resetDate: data.resetDate });
      }
      if (!response.ok) {
        if (response.status === 429) {
          setTurns(turns);
          persist(value, turns, typeof data.limit === "number" ? {
            limit: data.limit,
            used: data.used,
            remaining: data.remaining,
            resetDate: data.resetDate,
          } : usage);
        }
        throw new Error(data.error || "Failed to ask SceneIt AI");
      }
      const nextResult = data as AiDiscoveryResponse;
      const nextUsage = {
        limit: nextResult.limit ?? 10,
        used: nextResult.used ?? 0,
        remaining: nextResult.remaining ?? 0,
        resetDate: nextResult.resetDate,
      };
      const assistantTurn: ChatTurn = {
        id: createTurnId(),
        role: "assistant",
        content: nextResult.answer,
        result: nextResult,
      };
      const nextTurns = [...requestTurns, assistantTurn].slice(-24);
      setUsage(nextUsage);
      setTurns(nextTurns);
      persist(value, nextTurns, nextUsage);
      setMessage("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
      setTurns(turns);
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
            <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Discover with an agent</h1>
          </div>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Ask naturally. SceneIt can combine verified TMDB recommendations, your watch history, regional providers, TV episode data, and cited public sources.
        </p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{usageCopy}</p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") void ask(); }}
            placeholder="Ask for recommendations, a recap, an interview, or current release information..."
            disabled={isLimitReached}
            className="min-h-12 flex-1 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-orange-950"
          />
          <button
            type="button"
            onClick={() => void ask()}
            disabled={!message.trim() || isLoading || isLimitReached}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Ask
          </button>
        </div>

        {isLimitReached && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Daily limit reached. Your AI messages reset on {usage?.resetDate || "your next local day"}.
          </p>
        )}

        {turns.length === 0 && !isLimitReached && (
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                type="button"
                key={example}
                onClick={() => void ask(example)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300"
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

      {(turns.length > 0 || isLoading) && (
        <section className="space-y-6">
          {turns.map((turn) => (
            turn.role === "user" ? (
              <div key={turn.id} className="ml-auto max-w-3xl rounded-xl bg-orange-500 px-4 py-3 text-sm font-medium text-white">
                {turn.content}
              </div>
            ) : (
              <article key={turn.id} className="space-y-5">
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                      <Bot size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-gray-950 dark:text-white">SceneIt’s answer</h2>
                      <MessageResponse className="mt-3 text-[15px] leading-7 text-gray-700 dark:text-gray-200">
                        {turn.content}
                      </MessageResponse>
                    </div>
                  </div>

                  {(turn.result?.toolActivity?.length ?? 0) > 0 && (
                    <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Activity</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {turn.result?.toolActivity.map((item) => (
                          <span key={item} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {(turn.result?.sources?.length ?? 0) > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Search size={17} className="text-orange-500" />
                      <h2 className="font-semibold text-gray-950 dark:text-white">Sources used</h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {turn.result?.sources.map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-orange-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-orange-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-950 dark:text-white">{source.title}</p>
                              {source.source && <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">{source.source}</p>}
                            </div>
                            <ExternalLink size={15} className="shrink-0 text-gray-400" />
                          </div>
                          {source.snippet && <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{source.snippet}</p>}
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {(turn.result?.movies?.length || 0) > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-950 dark:text-white">Recommendations</h2>
                    <MovieGrid movies={turn.result?.movies || []} isLoading={false} />
                  </section>
                )}

                {(turn.result?.followUps?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {turn.result?.followUps.map((followUp) => (
                      <button
                        type="button"
                        key={followUp}
                        onClick={() => void ask(followUp)}
                        disabled={isLoading || isLimitReached}
                        className="rounded-full border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-700"
                      >
                        {followUp}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            )
          ))}

          {isLoading && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                  <Loader2 className="animate-spin" size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-950 dark:text-white">Working on your request</h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Choosing the right movie, TV, and web sources…</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
