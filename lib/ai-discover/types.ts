import type { MovieItem } from "@/types/types";

export const MAX_AGENT_STEPS = 8;
export const MAX_SERPER_SEARCHES = 4;
export const SERPER_RESULTS_PER_SEARCH = 5;
export const MAX_PAGE_READS = 3;
export const MAX_PAGE_MARKDOWN_CHARS = 18_000;

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type DiscoverySource = {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
};

export type AiDiscoverMode = "discover" | "explain" | "research";

export type AiDiscoverResponse = {
  mode: AiDiscoverMode;
  answer: string;
  movies: MovieItem[];
  sources: DiscoverySource[];
  toolActivity: string[];
  followUps: string[];
  total_results: number;
};

export type ToolExecutionState = {
  region: string;
  searchCount: number;
  pageReadCount: number;
  movies: Map<number, MovieItem>;
  searchResults: Map<string, DiscoverySource>;
  readSources: Map<string, DiscoverySource>;
  activity: Map<string, number>;
};

export function createToolExecutionState(region: string): ToolExecutionState {
  return {
    region,
    searchCount: 0,
    pageReadCount: 0,
    movies: new Map(),
    searchResults: new Map(),
    readSources: new Map(),
    activity: new Map(),
  };
}
