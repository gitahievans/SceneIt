export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const tmdbImageSizes = {
  poster: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
  backdrop: ["w300", "w780", "w1280", "original"],
  logo: ["w45", "w92", "w154", "w185", "w300", "w500", "original"],
} as const;

export type TmdbImageKind = keyof typeof tmdbImageSizes;
export type TmdbImageSize<K extends TmdbImageKind> = (typeof tmdbImageSizes)[K][number];

function validPath(path: string | null | undefined) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!/^\/[A-Za-z0-9._/-]+$/.test(trimmed) || trimmed.includes("..") || trimmed.includes("//")) return null;
  return trimmed;
}

export function tmdbImageUrl<K extends TmdbImageKind>(
  path: string | null | undefined,
  kind: K,
  size: TmdbImageSize<K>
): string | null {
  const safePath = validPath(path);
  if (!safePath || !(tmdbImageSizes[kind] as readonly string[]).includes(size)) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${safePath}`;
}

export function isRemoteSvg(url: string | null) {
  return Boolean(url && /\.svg(?:\?|$)/i.test(url));
}
