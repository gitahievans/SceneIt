import { NextResponse } from "next/server";
import { tmdbServer } from "@/utils/tmdb/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return NextResponse.json({ error: "Invalid TV ID" }, { status: 400 });
    }
    return NextResponse.json(await tmdbServer.details("tv", id));
  } catch (error) {
    console.error("Failed to fetch TV details:", error);
    return NextResponse.json({ error: "Failed to fetch TV details" }, { status: 502 });
  }
}
