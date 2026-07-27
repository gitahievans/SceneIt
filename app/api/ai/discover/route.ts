import { NextResponse } from "next/server";
import { z } from "zod";
import { runSceneItDiscovery } from "@/lib/ai-discover/agent";
import { createToolExecutionState } from "@/lib/ai-discover/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const conversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8_000),
});

const requestSchema = z.object({
  message: z.string().trim().min(1).max(4_000),
  region: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).default("US"),
  messages: z.array(conversationMessageSchema).max(24).default([]),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid AI discovery request", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const state = createToolExecutionState(parsed.data.region);
  try {
    const result = await runSceneItDiscovery({
      message: parsed.data.message,
      messages: parsed.data.messages,
      state,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI discovery failed", error);
    const message = error instanceof Error ? error.message : "AI discovery failed";
    const configurationError = /not configured|required for fallback|CLOUDFLARE_ACCOUNT_ID|SERPER_API_KEY/i.test(message);
    return NextResponse.json(
      { error: configurationError ? message : "SceneIt AI is temporarily unavailable. Please try again." },
      { status: configurationError ? 503 : 502 }
    );
  }
}
