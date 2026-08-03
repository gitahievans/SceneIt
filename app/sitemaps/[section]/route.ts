import { notFound } from "next/navigation";
import { collectionSitemap, staticSitemap, titleSitemap, urlset } from "@/utils/seo/sitemap";
export async function GET(_request: Request, { params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const entries = section === "static.xml" ? staticSitemap() : section === "collections.xml" ? await collectionSitemap() : section === "titles.xml" ? await titleSitemap() : null;
  if (!entries) notFound();
  return new Response(urlset(entries), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
