export const SITE_NAME = "SceneIt — AI Movie Recommendations";

export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://sceneit.app"
).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

export function mediaPath(kind: "movie" | "tv", id: number, title: string) {
  return `/${kind === "movie" ? "movies" : "tv"}/${id}-${slugify(title)}`;
}
