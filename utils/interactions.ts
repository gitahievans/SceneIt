import type { InteractionRequest, MediaType } from "@/types/types";

type FavoriteAction = Extract<InteractionRequest["action"], "favorited" | "unfavorited">;

export async function updateFavorite(
  mediaType: MediaType,
  mediaId: number,
  action: FavoriteAction,
): Promise<void> {
  const response = await fetch("/api/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: mediaType,
      media_id: mediaId,
      action,
    } satisfies InteractionRequest),
  });

  if (response.ok) return;

  const data = await response.json().catch(() => null) as { error?: string } | null;
  throw new Error(data?.error || "The favorite could not be updated.");
}
