"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { BriefingSettings } from "@/components/settings/BriefingSettings"
import { CalendarSettings } from "@/components/settings/CalendarSettings"
import { EmailSettings } from "@/components/settings/EmailSettings"
import { GeneralSettings } from "@/components/settings/GeneralSettings"
import { NotificationsSettings } from "@/components/settings/NotificationsSettings"
import { OKRsSettings } from "@/components/settings/OKRsSettings"
import { RitualsSettings } from "@/components/settings/RitualsSettings"
import { TasksSettings } from "@/components/settings/TasksSettings"
import { TeamsSettings } from "@/components/settings/TeamsSettings"
import type { SettingsTeamsChannel } from "@/components/settings/types"
import { WeeklyReviewSettings } from "@/components/settings/WeeklyReviewSettings"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AppSettings, CalendarAccount } from "@/types/settings"

type SettingsShellProps = {
  icloudConnected: boolean
  settings: AppSettings
  userEmail: string
  userName: string | null
}

const tabItems = [
  { value: "general", label: "General" },
  { value: "calendar", label: "Calendar" },
  { value: "tasks", label: "Tasks" },
  { value: "email", label: "Email" },
  { value: "teams", label: "Teams" },
  { value: "okrs", label: "OKRs" },
  { value: "briefing", label: "EA Briefing" },
  { value: "notifications", label: "Notifications" },
  { value: "rituals", label: "Daily Rituals" },
  { value: "weekly-review", label: "Weekly Review" },
] as const

function ensureCalendarAccounts(
  settings: AppSettings,
  userEmail: string,
  icloudConnected: boolean
) {
  const accounts = [...settings.calendarConfig.accounts]

  if (!accounts.some((account) => account.provider === "outlook")) {
    accounts.unshift({
      provider: "outlook",
      label: userEmail,
      calendarType: "work",
      enabled: true,
    })
  }

  if (
    icloudConnected &&
    !accounts.some((account) => account.provider === "icloud")
  ) {
    accounts.push({
      provider: "icloud",
      label: "iCloud",
      calendarType: "personal",
      enabled: true,
    })
  }

  return {
    ...settings,
    calendarConfig: {
      ...settings.calendarConfig,
      accounts,
    },
  }
}

export function SettingsShell({
  icloudConnected,
  settings,
  userEmail,
  userName,
}: SettingsShellProps) {
  const [state, setState] = useState(() =>
    ensureCalendarAccounts(settings, userEmail, icloudConnected)
  )
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [runningAction, setRunningAction] = useState<
    "sync" | "generate" | "full" | null
  >(null)
  const [teamsChannels, setTeamsChannels] = useState<SettingsTeamsChannel[]>([])
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [showIcloudHelp, setShowIcloudHelp] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadTeamsChannels() {
      try {
        const response = await fetch("/api/teams/channels")
        const payload = (await response.json()) as {
          data?: SettingsTeamsChannel[]
          error?: string | null
        }

        if (cancelled) {
          return
        }

        if (!response.ok) {
          setTeamsChannels([])
          setTeamsError(payload.error ?? "Unable to load Teams channels.")
          return
        }

        setTeamsChannels(payload.data ?? [])
        setTeamsError(null)
      } catch (error) {
        if (!cancelled) {
          setTeamsChannels([])
          setTeamsError(
            error instanceof Error
              ? error.message
              : "Unable to load Teams channels."
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingTeams(false)
        }
      }
    }

    void loadTeamsChannels()

    return () => {
      cancelled = true
    }
  }, [])

  async function saveSection(
    section: keyof Omit<AppSettings, "id" | "userId">,
    patch: Partial<Omit<AppSettings, "id" | "userId">>,
    message: string
  ) {
    setSavingSection(section)

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      })
      const payload = (await response.json()) as {
        data?: AppSettings | null
        error?: string | null
      }

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to save settings.")
      }

      setState(ensureCalendarAccounts(payload.data, userEmail, icloudConnected))
      toast.success(message)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save settings."
      )
    } finally {
      setSavingSection(null)
    }
  }

  async function runAction(action: "sync" | "generate" | "full") {
    setRunningAction(action)

    try {
      const endpoint =
        action === "sync"
          ? "/api/sync/all"
          : action === "generate"
            ? "/api/brief/generate"
            : "/api/sync/all?regenerate=true"

      const response = await fetch(endpoint, { method: "POST" })
      const payload = (await response.json()) as { error?: string | null }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to start action.")
      }

      toast.success("Action started.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start action."
      )
    } finally {
      setRunningAction(null)
    }
  }

  function updateCalendarAccount(
    provider: CalendarAccount["provider"],
    updates: Partial<CalendarAccount>
  ) {
    setState((current) => ({
      ...current,
      calendarConfig: {
        ...current.calendarConfig,
        accounts: current.calendarConfig.accounts.map((account) =>
          account.provider === provider ? { ...account, ...updates } : account
        ),
      },
    }))
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
      <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/60 p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Phase 4
          </p>
          <Badge variant="outline">Configuration hub</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          Settings
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
          One place to manage briefing inputs, schedules, module preferences, and
          notification defaults across the dashboard.
        </p>
      </section>

      <Tabs className="gap-6" defaultValue="general">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.value}
              className="h-auto flex-none rounded-full border border-border/70 bg-background px-3 py-2 data-active:bg-primary data-active:text-primary-foreground"
              value={tab.value}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings
            onSave={() =>
              saveSection(
                "briefingConfig",
                {
                  briefingConfig: {
                    ...state.briefingConfig,
                    timezone: state.briefingConfig.timezone,
                  },
                },
                "General settings saved."
              )
            }
            onTimezoneChange={(value) =>
              setState((current) => ({
                ...current,
                briefingConfig: { ...current.briefingConfig, timezone: value },
              }))
            }
            saving={savingSection === "briefingConfig"}
            timezone={state.briefingConfig.timezone}
            userEmail={userEmail}
            userName={userName}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarSettings
            accounts={state.calendarConfig.accounts}
            icloudConnected={icloudConnected}
            includeInBrief={state.calendarConfig.includeInBrief}
            onAccountChange={updateCalendarAccount}
            onIncludeInBriefChange={(value) =>
              setState((current) => ({
                ...current,
                calendarConfig: { ...current.calendarConfig, includeInBrief: value },
              }))
            }
            onSave={() =>
              saveSection(
                "calendarConfig",
                { calendarConfig: state.calendarConfig },
                "Calendar settings saved."
              )
            }
            onToggleIcloudHelp={() => setShowIcloudHelp((current) => !current)}
            saving={savingSection === "calendarConfig"}
            showIcloudHelp={showIcloudHelp}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksSettings
            config={state.tasksConfig}
            onChange={(config) =>
              setState((current) => ({ ...current, tasksConfig: config }))
            }
            onSave={() =>
              saveSection(
                "tasksConfig",
                { tasksConfig: state.tasksConfig },
                "Task settings saved."
              )
            }
            saving={savingSection === "tasksConfig"}
          />
        </TabsContent>

        <TabsContent value="email">
          <EmailSettings
            config={state.emailConfig}
            onChange={(config) =>
              setState((current) => ({ ...current, emailConfig: config }))
            }
            onSave={() =>
              saveSection(
                "emailConfig",
                { emailConfig: state.emailConfig },
                "Email settings saved."
              )
            }
            saving={savingSection === "emailConfig"}
          />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsSettings
            channels={teamsChannels}
            config={state.teamsConfig}
            error={teamsError}
            loading={loadingTeams}
            onChange={(config) =>
              setState((current) => ({ ...current, teamsConfig: config }))
            }
            onSave={() =>
              saveSection(
                "teamsConfig",
                { teamsConfig: state.teamsConfig },
                "Teams settings saved."
              )
            }
            saving={savingSection === "teamsConfig"}
          />
        </TabsContent>

        <TabsContent value="okrs">
          <OKRsSettings
            config={state.okrsConfig}
            onChange={(config) =>
              setState((current) => ({ ...current, okrsConfig: config }))
            }
            onSave={() =>
              saveSection(
                "okrsConfig",
                { okrsConfig: state.okrsConfig },
                "OKR settings saved."
              )
            }
            saving={savingSection === "okrsConfig"}
          />
        </TabsContent>

        <TabsContent value="briefing">
          <BriefingSettings
            config={state.briefingConfig}
            onChange={(config) =>
              setState((current) => ({ ...current, briefingConfig: config }))
            }
            onRunAction={runAction}
            onSave={() =>
              saveSection(
                "briefingConfig",
                { briefingConfig: state.briefingConfig },
                "Briefing settings saved."
              )
            }
            runningAction={runningAction}
            saving={savingSection === "briefingConfig"}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSettings
            config={state.notificationsConfig}
            onChange={(config) =>
              setState((current) => ({
                ...current,
                notificationsConfig: config,
              }))
            }
            onSave={() =>
              saveSection(
                "notificationsConfig",
                { notificationsConfig: state.notificationsConfig },
                "Notification settings saved."
              )
            }
            saving={savingSection === "notificationsConfig"}
          />
        </TabsContent>

        <TabsContent value="rituals">
          <RitualsSettings
            config={state.ritualsConfig}
            onChange={(config) =>
              setState((current) => ({ ...current, ritualsConfig: config }))
            }
            onSave={() =>
              saveSection(
                "ritualsConfig",
                { ritualsConfig: state.ritualsConfig },
                "Ritual settings saved."
              )
            }
            saving={savingSection === "ritualsConfig"}
          />
        </TabsContent>

        <TabsContent value="weekly-review">
          <WeeklyReviewSettings
            config={state.weeklyReviewConfig}
            onChange={(config) =>
              setState((current) => ({
                ...current,
                weeklyReviewConfig: config,
              }))
            }
            onSave={() =>
              saveSection(
                "weeklyReviewConfig",
                { weeklyReviewConfig: state.weeklyReviewConfig },
                "Weekly review settings saved."
              )
            }
            saving={savingSection === "weeklyReviewConfig"}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
