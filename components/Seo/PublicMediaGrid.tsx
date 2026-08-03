import type { ContentKind } from "@/utils/content/collections";
import PublicMediaCard, { type PublicMediaItem } from "./PublicMediaCard";

export default function PublicMediaGrid({ items, kind, explain = false }: {
  items: PublicMediaItem[];
  kind: ContentKind;
  explain?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <PublicMediaCard
          key={item.id}
          item={item}
          kind={kind}
          reason={explain ? `${item.overview?.split(/(?<=[.!?])\s/)[0] || "A strong audience pick"} This title fits the list's theme and selection thresholds.` : undefined}
        />
      ))}
    </div>
  );
}
