import { SITE_URL } from "@/utils/seo/site";
export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE_URL}/sitemaps/static.xml</loc></sitemap><sitemap><loc>${SITE_URL}/sitemaps/collections.xml</loc></sitemap><sitemap><loc>${SITE_URL}/sitemaps/titles.xml</loc></sitemap></sitemapindex>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
