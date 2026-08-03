import type { Metadata } from "next";
import type { CollectionDefinition } from "@/utils/content/collections";
import { absoluteUrl, SITE_NAME } from "./site";

export function pageMetadata(title: string, description: string, path: string, options?: { noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: options?.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, url: absoluteUrl(path), siteName: SITE_NAME, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}

export function collectionMetadata(collection: CollectionDefinition, path: string, page: number): Metadata {
  const pageSuffix = page > 1 ? ` — Page ${page}` : "";
  const canonical = page > 1 ? `${path}?page=${page}` : path;
  return pageMetadata(`${collection.title}${pageSuffix}`, collection.description, canonical);
}
