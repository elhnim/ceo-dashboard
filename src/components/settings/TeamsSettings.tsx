"use client"

import { LoaderCircleIcon } from "lucide-react"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
import { LOOKBACK_OPTIONS } from "@/components/settings/options"
import type { SettingsTeamsChannel } from "@/components/settings/types"
import type { AppSettings } from "@/types/settings"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type TeamsSettingsProps = {
  channels: SettingsTeamsChannel[]
  config: AppSettings["teamsConfig"]
  error: string | null
  loading: boolean
  onChange: (config: AppSettings["teamsConfig"]) => void
  onSave: () => void
  saving: boolean
}

export function TeamsSettings({
  channels,
  config,
  error,
  loading,
  onChange,
  onSave,
  saving,
}: TeamsSettingsProps) {
  return (
    <SettingsSectionCard
      description="Choose which Teams channels are monitored and how far back activity should be scanned."
      onSave={onSave}
      saving={saving}
      title="Teams"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Monitored channels</Label>
          {loading ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircleIcon className="size-4 animate-spin" />
              Loading channels
            </span>
          ) : null}
        </div>
        <div className="space-y-2">
          {channels.length > 0 ? (
            channels.map((channel) => {
              const compositeId = `${channel.teamId}:${channel.channelId}`
              const checked = config.monitoredChannels.includes(compositeId)

              return (
                <div
                  key={compositeId}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4"
                >
                  <div>
                    <p className="font-medium">{channel.channelName}</p>
                    <p className="text-sm text-muted-foreground">
                      {channel.teamName}
                    </p>
                  </div>
                  <Switch
                    checked={checked}
                    onCheckedChange={(nextChecked) =>
                      onChange({
                        ...config,
                        monitoredChannels: nextChecked
                          ? [...config.monitoredChannels, compositeId]
                          : config.monitoredChannels.filter(
                              (value) => value !== compositeId
                            ),
                      })
                    }
                  />
                </div>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
              {error || "No channels available yet for this Microsoft account."}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lookback window</Label>
        <Select
          value={String(config.lookbackHours)}
          onValueChange={(value) =>
            onChange({ ...config, lookbackHours: Number(value) })
          }
        >
          <SelectTrigger className="w-full md:max-w-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOOKBACK_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}h
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div>
          <p className="font-medium">Include Teams in EA Briefing</p>
          <p className="text-sm text-muted-foreground">
            Include channel summaries when the brief is generated.
          </p>
        </div>
        <Switch
          checked={config.includeInBrief}
          onCheckedChange={(checked) =>
            onChange({ ...config, includeInBrief: checked })
          }
        />
      </div>
    </SettingsSectionCard>
  )
}
