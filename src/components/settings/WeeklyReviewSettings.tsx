"use client"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
import { WEEKDAY_OPTIONS } from "@/components/settings/options"
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

type WeeklyReviewSettingsProps = {
  config: AppSettings["weeklyReviewConfig"]
  onChange: (config: AppSettings["weeklyReviewConfig"]) => void
  onSave: () => void
  saving: boolean
}

export function WeeklyReviewSettings({
  config,
  onChange,
  onSave,
  saving,
}: WeeklyReviewSettingsProps) {
  return (
    <SettingsSectionCard
      description="Choose the preferred day for weekly reflection and whether reminders should fire."
      onSave={onSave}
      saving={saving}
      title="Weekly Review"
    >
      <div className="space-y-2">
        <Label>Preferred day</Label>
        <Select
          value={config.preferredDay}
          onValueChange={(value) =>
            onChange({
              ...config,
              preferredDay:
                value as AppSettings["weeklyReviewConfig"]["preferredDay"],
            })
          }
        >
          <SelectTrigger className="w-full md:max-w-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEEKDAY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div>
          <p className="font-medium">Reminder</p>
          <p className="text-sm text-muted-foreground">
            Send a reminder when it is time for the weekly review.
          </p>
        </div>
        <Switch
          checked={config.reminderEnabled}
          onCheckedChange={(checked) =>
            onChange({ ...config, reminderEnabled: checked })
          }
        />
      </div>
    </SettingsSectionCard>
  )
}
