"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { isRemoteSvg, tmdbImageUrl, type TmdbImageKind, type TmdbImageSize } from "@/utils/tmdb/image";

type MediaImageProps<K extends TmdbImageKind> = Omit<ImageProps, "src" | "onError"> & {
  path?: string | null;
  kind: K;
  size: TmdbImageSize<K>;
  fallback?: "poster" | "backdrop" | "provider";
  fallbackLabel?: string;
};

export default function MediaImage<K extends TmdbImageKind>({
  path, kind, size, fallback = "poster", fallbackLabel = "Artwork unavailable", className, alt, ...props
}: MediaImageProps<K>) {
  const src = tmdbImageUrl(path, kind, size);
  const [attempt, setAttempt] = useState<"optimized" | "direct" | "fallback">(src ? "optimized" : "fallback");

  useEffect(() => setAttempt(src ? "optimized" : "fallback"), [src]);

  if (attempt === "fallback") {
    if (fallback === "backdrop") return <div aria-label={fallbackLabel} className={`bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-800 ${className || ""}`} />;
    if (fallback === "provider") {
      const initials = fallbackLabel.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
      return <div role="img" aria-label={`${fallbackLabel} logo unavailable`} className={`flex items-center justify-center bg-gradient-to-br from-orange-500 to-purple-700 font-bold text-white ${className || ""}`}>{initials}</div>;
    }
    return <Image {...props} src="/assets/poster-placeholder.svg" alt={alt || fallbackLabel} className={className} unoptimized />;
  }

  return (
    <Image
      {...props}
      key={`${src}-${attempt}`}
      src={src!}
      alt={alt}
      className={className}
      unoptimized={attempt === "direct" || isRemoteSvg(src)}
      onError={() => setAttempt((value) => value === "optimized" && !isRemoteSvg(src) ? "direct" : "fallback")}
    />
  );
}
