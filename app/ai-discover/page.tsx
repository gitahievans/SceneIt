"use client";

import { useEffect, useState } from "react";
import { Bot, ExternalLink, Loader2, Search, Send, Sparkles } from "lucide-react";
import MovieGrid from "@/components/Common/MovieGrid";
import { MessageResponse } from "@/components/ai-elements/message";
import type { MovieItem } from "@/types/types";

type ConversationMessage = { role: "user" | "assistant"; content: string };
type DiscoverySource = { title: string; url: string; snippet?: string; source?: string };
type AiDiscoveryResponse = {
  mode: "discover" | "explain" | "research";
  answer: string;
  movies: MovieItem[];
  sources: DiscoverySource[];
  toolActivity: string[];
  followUps: string[];
  total_results: number;
};

type AiDiscoveryCache = {
  message: string;
  result: AiDiscoveryResponse;
  conversation: ConversationMessage[];
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
  const [result, setResult] = useState<AiDiscoveryResponse | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem(CACHE_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached) as AiDiscoveryCache;
      if (!parsed?.result) return;
      setMessage(parsed.message || "");
      setResult(parsed.result);
      setConversation(Array.isArray(parsed.conversation) ? parsed.conversation : []);
    } catch {
      window.sessionStorage.removeItem(CACHE_KEY);
    }
  }, []);

  const persist = (nextMessage: string, nextResult: AiDiscoveryResponse, nextConversation: ConversationMessage[]) => {
    try {
      window.sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ message: nextMessage, result: nextResult, conversation: nextConversation } satisfies AiDiscoveryCache)
      );
    } catch {
      // Conversation restore is optional; the request still succeeds without session storage.
    }
  };

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
        body: JSON.stringify({ message: value, region: "US", messages: conversation.slice(-12) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to ask SceneIt AI");
      const nextResult = data as AiDiscoveryResponse;
      const userMessage: ConversationMessage = { role: "user", content: value };
      const assistantMessage: ConversationMessage = { role: "assistant", content: nextResult.answer };
      const nextConversation: ConversationMessage[] = [
        ...conversation,
        userMessage,
        assistantMessage,
      ].slice(-16);
      setResult(nextResult);
      setConversation(nextConversation);
      persist(value, nextResult, nextConversation);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
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
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") void ask(); }}
            placeholder="Ask for recommendations, a recap, an interview, or current release information..."
            className="min-h-12 flex-1 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-orange-950"
          />
          <button
            type="button"
            onClick={() => void ask()}
            disabled={!message.trim() || isLoading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Ask
          </button>
        </div>

        {!result && (
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                type="button"
                key={example}
                onClick={() => void ask(example)}
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

      {(isLoading || result) && (
        <section className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                {isLoading ? <Loader2 className="animate-spin" size={17} /> : <Bot size={17} />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-950 dark:text-white">
                  {isLoading ? "Working on your request" : "SceneIt’s answer"}
                </h2>
                {isLoading ? (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Choosing the right movie, TV, and web sources…</p>
                ) : (
                  <MessageResponse className="mt-3 text-[15px] leading-7 text-gray-700 dark:text-gray-200">
                    {result?.answer || ""}
                  </MessageResponse>
                )}
              </div>
            </div>

            {!isLoading && (result?.toolActivity?.length ?? 0) > 0 && (
              <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Activity</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result?.toolActivity.map((item) => (
                    <span key={item} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isLoading && (result?.sources?.length ?? 0) > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Search size={17} className="text-orange-500" />
                <h2 className="font-semibold text-gray-950 dark:text-white">Sources used</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {result?.sources.map((source) => (
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

          {(isLoading || (result?.movies?.length || 0) > 0) && (
            <section className="space-y-3">
              {!isLoading && <h2 className="text-xl font-semibold text-gray-950 dark:text-white">Recommendations</h2>}
              <MovieGrid movies={result?.movies || []} isLoading={isLoading} />
            </section>
          )}

          {!isLoading && (result?.followUps?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {result?.followUps.map((followUp) => (
                <button
                  type="button"
                  key={followUp}
                  onClick={() => void ask(followUp)}
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
