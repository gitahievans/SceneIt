import type { Metadata } from "next";
import ProviderCatalog from "@/components/Providers/ProviderCatalog";
import { pageMetadata } from "@/utils/seo/metadata";
import { tmdbServer } from "@/utils/tmdb/server";

export const metadata: Metadata = pageMetadata("Streaming Providers", "Browse the complete catalog of US movie and TV streaming providers.", "/providers");

export default async function ProvidersPage() {
  const providers = await tmdbServer.providers("US").then((data) => data.results).catch(() => []);
  return <ProviderCatalog providers={providers} />;
}
