import "server-only"

import Anthropic from "@anthropic-ai/sdk"

import { createAdminClient } from "@/lib/supabase/admin"
import { getSettings } from "@/lib/services/settings"
import type { DailyBrief } from "@/types/brief"

interface GenerateBriefOptions {
  dataAsOf?: string
  stage1CompletedAt?: string | null
}

function getDashboardUserId() {
  const userId = process.env.DASHBOARD_USER_ID

  if (!userId) {
    throw new Error("Missing required environment variable: DASHBOARD_USER_ID")
  }

  return userId
}

function getAnthropicApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("Missing required environment variable: ANTHROPIC_API_KEY")
  }

  return apiKey
}

function startOfWeekISO() {
  const date = new Date()
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

function endOfWeekISO() {
  const date = new Date(startOfWeekISO())
  date.setDate(date.getDate() + 6)
  date.setHours(23, 59, 59, 999)
  return date.toISOString()
}

function getTextContent(content: Anthropic.Messages.Message["content"]) {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim()
}

function isBriefSection(value: unknown): value is DailyBrief["focus"] {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.content === "string" &&
    (candidate.format === "narrative" || candidate.format === "structured")
  )
}

function validateBriefPayload(payload: unknown): Omit<
  DailyBrief,
  "generatedAt" | "dataAsOf" | "triggeredBy"
> {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Anthropic returned a non-object brief payload")
  }

  const candidate = payload as Record<string, unknown>

  if (
    !isBriefSection(candidate.focus) ||
    !isBriefSection(candidate.calendar) ||
    !isBriefSection(candidate.tasks) ||
    !isBriefSection(candidate.email) ||
    !isBriefSection(candidate.okrs)
  ) {
    throw new Error("Anthropic returned an invalid brief section")
  }

  if (
    typeof candidate.teams !== "object" ||
    candidate.teams === null ||
    !isBriefSection((candidate.teams as Record<string, unknown>).actions) ||
    !isBriefSection((candidate.teams as Record<string, unknown>).channels)
  ) {
    throw new Error("Anthropic returned an invalid teams section")
  }

  return {
    focus: candidate.focus,
    calendar: candidate.calendar,
    tasks: candidate.tasks,
    email: candidate.email,
    teams: {
      actions: (candidate.teams as Record<string, unknown>)
        .actions as DailyBrief["teams"]["actions"],
      channels: (candidate.teams as Record<string, unknown>)
        .channels as DailyBrief["teams"]["channels"],
    },
    okrs: candidate.okrs,
  }
}

export async function generateBrief(
  triggeredBy: "scheduled" | "manual",
  options: GenerateBriefOptions = {}
): Promise<DailyBrief> {
  const supabase = createAdminClient()
  const settings = await getSettings(getDashboardUserId(), { useAdminClient: true })
  const [calendarEvents, tasks, emails, teamsData, okrs, businesses] =
    await Promise.all([
      supabase
        .from("calendar_events")
        .select("*")
        .gte("start_at", startOfWeekISO())
        .lte("start_at", endOfWeekISO()),
      supabase
        .from("tasks_cache")
        .select("*")
        .neq("status", "completed")
        .order("importance", { ascending: false }),
      supabase
        .from("emails_cache")
        .select("*")
        .is("action_taken", null)
        .order("received_at", { ascending: false }),
      supabase.from("teams_cache").select("*").order("received_at", { ascending: false }),
      supabase
        .from("objectives")
        .select(
          "id, business_id, title, description, status, cadence, progress, key_results(id, title, description, target_value, current_value, unit, display_order)"
        )
        .eq("status", "active"),
      supabase.from("businesses").select("id, name").eq("is_active", true),
    ])

  for (const query of [calendarEvents, tasks, emails, teamsData, okrs, businesses]) {
    if (query.error) {
      throw new Error(query.error.message)
    }
  }

  const today = new Date().toISOString().split("T")[0]
  const { briefingConfig } = settings
  const client = new Anthropic({ apiKey: getAnthropicApiKey() })
  const response = await client.messages.create({
    model: briefingConfig.model,
    max_tokens: 2000,
    system: `You are an executive assistant briefing a multi-business CEO who has ADHD.
Your job is to synthesise the data below into a clear, focused daily brief.

Rules:
- Prioritise ruthlessly. Surface only what requires action today.
- Personal and family calendar commitments (personal calendar_type) are hard constraints. Never suggest working during those times.
- The "focus" section must be ONE thing — the single most important action given today's available time.
- Be concise. Short sentences. No waffle.
- Available focus windows = time slots not blocked by calendar events.
- Return valid JSON matching the schema exactly. No markdown, no prose outside JSON.`,
    messages: [
      {
        role: "user",
        content: `Today is ${today}.

CALENDAR EVENTS THIS WEEK:
${JSON.stringify(calendarEvents.data, null, 2)}

INCOMPLETE TASKS:
${JSON.stringify(tasks.data, null, 2)}

URGENT EMAILS:
${JSON.stringify(emails.data, null, 2)}

TEAMS ACTIVITY:
${JSON.stringify(teamsData.data, null, 2)}

ACTIVE OKRs:
${JSON.stringify(okrs.data, null, 2)}

BUSINESSES:
${JSON.stringify(businesses.data, null, 2)}

USER FORMAT PREFERENCES:
${JSON.stringify(briefingConfig.sections, null, 2)}

Return this JSON structure exactly:
{
  "focus": { "content": "...", "format": "${briefingConfig.sections.focus.format}" },
  "calendar": { "content": "...", "format": "${briefingConfig.sections.calendar.format}" },
  "tasks": { "content": "...", "format": "${briefingConfig.sections.tasks.format}" },
  "email": { "content": "...", "format": "${briefingConfig.sections.email.format}" },
  "teams": {
    "actions": { "content": "...", "format": "${briefingConfig.sections.teams.format}" },
    "channels": { "content": "...", "format": "${briefingConfig.sections.teams.format}" }
  },
  "okrs": { "content": "...", "format": "${briefingConfig.sections.okrs.format}" }
}`,
      },
    ],
  })

  const rawText = getTextContent(response.content)
  let parsed: unknown

  try {
    parsed = JSON.parse(rawText)
  } catch (error) {
    console.error("Failed to parse Anthropic brief JSON:", rawText)
    throw new Error(
      error instanceof Error ? error.message : "Anthropic returned invalid JSON"
    )
  }

  const brief: DailyBrief = {
    ...validateBriefPayload(parsed),
    generatedAt: new Date().toISOString(),
    dataAsOf: options.dataAsOf ?? new Date().toISOString(),
    triggeredBy,
  }

  const { error } = await supabase.from("daily_briefs").insert({
    brief_json: brief,
    generated_at: brief.generatedAt,
    stage1_completed_at: options.stage1CompletedAt ?? null,
    stage2_completed_at: new Date().toISOString(),
    triggered_by: triggeredBy,
  })

  if (error) {
    throw new Error(error.message)
  }

  return brief
}
