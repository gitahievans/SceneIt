export type ContentKind = "movie" | "tv";

export type CollectionDefinition = {
  slug: string;
  group: "collections" | "decades" | "moods" | "occasions";
  kind: ContentKind;
  title: string;
  description: string;
  introduction: string;
  methodology: string;
  filters: Record<string, string>;
  updatedAt: string;
  indexable: boolean;
};

const currentYear = new Date().getUTCFullYear();

const shared = [
  ["moods", "feel-good", "Feel-Good", "warm, upbeat stories with an optimistic payoff", { "vote_average.gte": "6.5", "vote_count.gte": "250", with_genres: "35,10751" }],
  ["moods", "funny", "Funny", "comedies audiences consistently rate highly", { with_genres: "35", "vote_average.gte": "6.5", "vote_count.gte": "300" }],
  ["moods", "romantic", "Romantic", "engaging romance-led stories for an easy watch", { with_genres: "10749", "vote_average.gte": "6.5", "vote_count.gte": "250" }],
  ["moods", "scary", "Scary", "popular horror stories built for suspense and scares", { with_genres: "27", "vote_average.gte": "6", "vote_count.gte": "300" }],
  ["moods", "comforting", "Comforting", "gentle, familiar stories suited to a low-stress watch", { with_genres: "10751,35,18", "vote_average.gte": "6.5", "vote_count.gte": "200" }],
  ["moods", "tense", "Tense", "thrillers with sustained tension and strong audience response", { with_genres: "53", "vote_average.gte": "6.5", "vote_count.gte": "300" }],
  ["moods", "inspiring", "Inspiring", "acclaimed dramas and true-story favorites with an uplifting arc", { with_genres: "18,36", "vote_average.gte": "7", "vote_count.gte": "250" }],
  ["moods", "mind-bending", "Mind-Bending", "ambitious science-fiction and mystery stories that reward attention", { with_genres: "878,9648", "vote_average.gte": "7", "vote_count.gte": "300" }],
  ["occasions", "tonight", "What to Watch Tonight", "reliable, broadly appealing picks for tonight", { sort_by: "popularity.desc", "vote_average.gte": "6.5", "vote_count.gte": "300" }],
  ["occasions", "this-weekend", "What to Watch This Weekend", "engaging favorites worth making time for this weekend", { sort_by: "popularity.desc", "vote_average.gte": "7", "vote_count.gte": "500" }],
  ["occasions", "date-night", "Date Night", "romantic and entertaining picks suited to a shared evening", { with_genres: "10749,35", "vote_average.gte": "6.5", "vote_count.gte": "250" }],
  ["occasions", "family-night", "Family Night", "accessible family stories with a strong audience track record", { with_genres: "10751", "vote_average.gte": "6.5", "vote_count.gte": "200" }],
  ["occasions", "friends", "Watch With Friends", "energetic crowd-pleasers that are easy to enjoy together", { with_genres: "28,35", "vote_average.gte": "6.5", "vote_count.gte": "400" }],
  ["occasions", "watching-alone", "Watch Alone", "absorbing stories that reward a focused solo watch", { with_genres: "18,9648,878", "vote_average.gte": "7", "vote_count.gte": "300" }],
  ["collections", "under-90-minutes", "Under 90 Minutes", "shorter picks that fit into a 90-minute window", { "with_runtime.lte": "90", "vote_average.gte": "6.5", "vote_count.gte": "200" }],
  ["collections", "under-two-hours", "Under Two Hours", "well-rated picks that finish in less than two hours", { "with_runtime.lte": "119", "vote_average.gte": "6.5", "vote_count.gte": "300" }],
  ["collections", "top-rated", "Top Rated", "highly rated favorites backed by a meaningful number of TMDB votes", { sort_by: "vote_average.desc", "vote_count.gte": "1000" }],
  ["collections", "hidden-gems", "Hidden Gems", "well-rated titles with smaller audiences than blockbuster releases", { sort_by: "vote_average.desc", "vote_average.gte": "7", "vote_count.gte": "100", "vote_count.lte": "1500" }],
  ["collections", "new-releases", "New Releases", "recent releases with enough audience activity to be useful", { sort_by: "primary_release_date.desc", "primary_release_date.gte": `${currentYear - 1}-01-01`, "vote_count.gte": "50" }],
  ["collections", "trending", "Trending", "widely watched titles attracting attention right now", { sort_by: "popularity.desc", "vote_count.gte": "100" }],
] as const;

const decades = [1980, 1990, 2000, 2010, 2020].map((start) => ({
  slug: `${start}s`,
  title: `Best ${start}s`,
  description: `standout releases from ${start} through ${Math.min(start + 9, currentYear)}`,
  filters: {
    "primary_release_date.gte": `${start}-01-01`,
    "primary_release_date.lte": `${Math.min(start + 9, currentYear)}-12-31`,
    sort_by: "vote_average.desc",
    "vote_count.gte": "500",
  },
}));

export const collections: CollectionDefinition[] = (["movie", "tv"] as ContentKind[]).flatMap((kind) => [
  ...shared.map(([group, slug, label, description, filters]) => ({
    slug,
    group,
    kind,
    title: `${label} ${kind === "movie" ? "Movies" : "TV Shows"}`,
    description: `Discover ${description}.`,
    introduction: `This SceneIt list helps you quickly choose ${description}. Results are selected for the United States and balance audience response with practical watchability.`,
    methodology: "We rank eligible titles using TMDB audience ratings, vote confidence, relevance to the theme, and current popularity. Ratings can change as new votes are added.",
    filters,
    updatedAt: new Date().toISOString().slice(0, 10),
    indexable: true,
  })),
  ...decades.map((decade) => ({
    slug: decade.slug,
    group: "decades" as const,
    kind,
    title: `${decade.title} ${kind === "movie" ? "Movies" : "TV Shows"}`,
    description: `Explore ${decade.description}.`,
    introduction: `Revisit ${decade.description}, selected for viewers who want a strong starting point instead of an exhaustive catalog.`,
    methodology: "Titles are ranked by TMDB audience rating with a minimum vote threshold, then checked for relevance to the release decade.",
    filters: decade.filters,
    updatedAt: new Date().toISOString().slice(0, 10),
    indexable: true,
  })),
]);

export function getCollection(kind: ContentKind, group: CollectionDefinition["group"], slug: string) {
  return collections.find((item) => item.kind === kind && item.group === group && item.slug === slug);
}
