import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionPage from "@/components/Seo/CollectionPage";
import { getCollection, type CollectionDefinition } from "@/utils/content/collections";
import { collectionMetadata } from "@/utils/seo/metadata";

type Props = { params: Promise<{ slug: string; collectionSlug: string }>; searchParams: Promise<{ page?: string }> };
function resolve(group: string, slug: string) { return getCollection("movie", group as CollectionDefinition["group"], slug); }
function pageNumber(value?: string) { const page = Number(value || "1"); return Number.isInteger(page) && page > 0 && page <= 500 ? page : 1; }
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> { const { slug: group, collectionSlug } = await params; const item = resolve(group, collectionSlug); if (!item) return {}; const page = pageNumber((await searchParams).page); return collectionMetadata(item, `/movies/${group}/${collectionSlug}`, page); }
export default async function Page({ params, searchParams }: Props) { const { slug: group, collectionSlug } = await params; const item = resolve(group, collectionSlug); if (!item) notFound(); return <CollectionPage collection={item} page={pageNumber((await searchParams).page)} path={`/movies/${group}/${collectionSlug}`} />; }
