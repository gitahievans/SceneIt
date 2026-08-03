import CollectionPage from "./CollectionPage";
import type { CollectionDefinition, ContentKind } from "@/utils/content/collections";
import TrackEvent from "@/components/Analytics/TrackEvent";

export default function TaxonomyPage({ kind, title, description, filters, page, path }: {
  kind: ContentKind; title: string; description: string; filters: Record<string, string>; page: number; path: string;
}) {
  const collection: CollectionDefinition = {
    kind, slug: path.split("/").at(-1) || "browse", group: "collections", title, description,
    introduction: `${description} This page focuses on useful, popular choices for viewers in the United States.`,
    methodology: "Eligible titles are ranked using TMDB popularity, audience rating, and vote count. Streaming availability and ratings can change over time.",
    filters, updatedAt: new Date().toISOString().slice(0, 10), indexable: true,
  };
  return <><TrackEvent name={filters.with_watch_providers ? "provider_selected" : "collection_opened"} parameters={{ kind, title }} /><CollectionPage collection={collection} page={page} path={path} /></>;
}
