import Link from "next/link";
import JsonLd from "@/utils/seo/jsonLd";
import { absoluteUrl } from "@/utils/seo/site";

export default function Breadcrumbs({ items }: { items: Array<{ name: string; href: string }> }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {index === items.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.href} className="hover:text-orange-600">{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.href),
        })),
      }} />
    </>
  );
}
