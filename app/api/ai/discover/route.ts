import { NextResponse } from "next/server";
import { z } from "zod";
import { runSceneItDiscovery } from "@/lib/ai-discover/agent";
import { createToolExecutionState } from "@/lib/ai-discover/types";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const conversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8_000),
});

const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Must be a valid YYYY-MM-DD date");

const timeZoneSchema = z.string().trim().min(1).max(80).refine((value) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}, "Must be a valid IANA time zone");

const requestSchema = z.object({
  message: z.string().trim().min(1).max(4_000),
  region: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).default("US"),
  messages: z.array(conversationMessageSchema).max(24).default([]),
  localDate: localDateSchema,
  timeZone: timeZoneSchema,
});

const DAILY_LIMIT = 10;

type UsageResult = {
  allowed: boolean;
  used: number;
  remaining: number;
  reset_date?: string;
  resetDate?: string;
};

function formatLocalDate(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeUsageResult(data: unknown): UsageResult | null {
  const value = Array.isArray(data) ? data[0] : data;
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.allowed !== "boolean" ||
    typeof row.used !== "number" ||
    typeof row.remaining !== "number"
  ) {
    return null;
  }

  const resetDate = typeof row.reset_date === "string"
    ? row.reset_date
    : typeof row.resetDate === "string"
      ? row.resetDate
      : undefined;

  return {
    allowed: row.allowed,
    used: row.used,
    remaining: row.remaining,
    resetDate,
  };
}

function usagePayload(usage: UsageResult) {
  return {
    limit: DAILY_LIMIT,
    used: usage.used,
    remaining: usage.remaining,
    resetDate: usage.resetDate,
  };
}

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

  const expectedLocalDate = formatLocalDate(new Date(), parsed.data.timeZone);
  if (parsed.data.localDate !== expectedLocalDate) {
    return NextResponse.json(
      { error: "Invalid AI discovery request", details: { localDate: ["Local date does not match the supplied time zone"] } },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: usageData, error: usageError } = await supabase.rpc("consume_ai_discover_daily_credit", {
    p_usage_date: parsed.data.localDate,
    p_limit: DAILY_LIMIT,
  });
  if (usageError) {
    console.error("AI discovery usage check failed", usageError);
    return NextResponse.json({ error: "Unable to verify AI discovery usage. Please try again." }, { status: 500 });
  }

  const usage = normalizeUsageResult(usageData);
  if (!usage) {
    console.error("AI discovery usage check returned an invalid response", usageData);
    return NextResponse.json({ error: "Unable to verify AI discovery usage. Please try again." }, { status: 500 });
  }

  if (!usage.allowed) {
    return NextResponse.json(
      { error: "Daily AI message limit reached", ...usagePayload(usage) },
      { status: 429 }
    );
  }

  const state = createToolExecutionState(parsed.data.region);
  try {
    const result = await runSceneItDiscovery({
      message: parsed.data.message,
      messages: parsed.data.messages,
      state,
    });
    return NextResponse.json({ ...result, ...usagePayload(usage) });
  } catch (error) {
    console.error("AI discovery failed", error);
    return NextResponse.json(
      {
        error: "SceneIt AI could not complete that request. Please try again.",
        retryable: true,
      },
      { status: 502 }
    );
  }
}
