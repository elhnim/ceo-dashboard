"use client"

import { CalendarDaysIcon, CloudIcon, PlusIcon } from "lucide-react"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
import type { CalendarAccount } from "@/types/settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type CalendarSettingsProps = {
  accounts: CalendarAccount[]
  includeInBrief: boolean
  icloudConnected: boolean
  showIcloudHelp: boolean
  onAccountChange: (
    provider: CalendarAccount["provider"],
    updates: Partial<CalendarAccount>
  ) => void
  onIncludeInBriefChange: (value: boolean) => void
  onToggleIcloudHelp: () => void
  onSave: () => void
  saving: boolean
}

export function CalendarSettings({
  accounts,
  includeInBrief,
  icloudConnected,
  showIcloudHelp,
  onAccountChange,
  onIncludeInBriefChange,
  onToggleIcloudHelp,
  onSave,
  saving,
}: CalendarSettingsProps) {
  return (
    <SettingsSectionCard
      description="Manage connected calendar accounts and control what feeds into the EA briefing."
      onSave={onSave}
      saving={saving}
      title="Calendar"
    >
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.provider}
            className="grid gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[1.2fr_180px_120px]"
          >
            <div className="space-y-2">
              <Label>{account.provider === "outlook" ? "Outlook" : "iCloud"}</Label>
              <div className="flex items-center gap-2">
                {account.provider === "outlook" ? (
                  <CalendarDaysIcon className="size-4 text-muted-foreground" />
                ) : (
                  <CloudIcon className="size-4 text-muted-foreground" />
                )}
                <Input
                  onChange={(event) =>
                    onAccountChange(account.provider, { label: event.target.value })
                  }
                  value={account.label}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Calendar type</Label>
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2">
                <span className="text-sm text-muted-foreground">Work</span>
                <Switch
                  checked={account.calendarType === "personal"}
                  onCheckedChange={(checked) =>
                    onAccountChange(account.provider, {
                      calendarType: checked ? "personal" : "work",
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">Personal</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enabled</Label>
              <div className="flex h-8 items-center justify-between rounded-xl border border-border/70 bg-background px-3">
                <span className="text-sm text-muted-foreground">
                  {account.enabled ? "Included" : "Paused"}
                </span>
                <Switch
                  checked={account.enabled}
                  onCheckedChange={(checked) =>
                    onAccountChange(account.provider, { enabled: checked })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">iCloud Calendar</p>
          <Badge variant={icloudConnected ? "secondary" : "outline"}>
            {icloudConnected ? "Connected via env" : "Not configured"}
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          iCloud credentials are intentionally not stored in the app database. If
          you want to add iCloud, configure `ICLOUD_USERNAME` and
          `ICLOUD_APP_PASSWORD` in the environment for this app.
        </p>
        <Button className="mt-4" onClick={onToggleIcloudHelp} variant="outline">
          <PlusIcon />
          Add iCloud Calendar
        </Button>
        {showIcloudHelp ? (
          <div className="mt-4 rounded-xl border border-border/70 bg-background p-4 text-sm leading-6 text-muted-foreground">
            After those env vars are set and the app restarts, this page will show
            iCloud as connected. The credentials are never exposed in the UI.
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div>
          <p className="font-medium">Include calendar in EA Briefing</p>
          <p className="text-sm text-muted-foreground">
            Use calendar context when generating the daily executive brief.
          </p>
        </div>
        <Switch
          checked={includeInBrief}
          onCheckedChange={onIncludeInBriefChange}
        />
      </div>
    </SettingsSectionCard>
  )
}
