"use client"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
import type { AppSettings } from "@/types/settings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type RitualsSettingsProps = {
  config: AppSettings["ritualsConfig"]
  onChange: (config: AppSettings["ritualsConfig"]) => void
  onSave: () => void
  saving: boolean
}

export function RitualsSettings({
  config,
  onChange,
  onSave,
  saving,
}: RitualsSettingsProps) {
  return (
    <SettingsSectionCard
      description="Set the default start and end anchors for the daily operating rhythm."
      onSave={onSave}
      saving={saving}
      title="Daily Rituals"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Morning Kickoff time</Label>
          <Input
            onChange={(event) =>
              onChange({ ...config, morningKickoffTime: event.target.value })
            }
            type="time"
            value={config.morningKickoffTime}
          />
        </div>
        <div className="space-y-2">
          <Label>End-of-Day Review time</Label>
          <Input
            onChange={(event) =>
              onChange({ ...config, endOfDayTime: event.target.value })
            }
            type="time"
            value={config.endOfDayTime}
          />
        </div>
      </div>
    </SettingsSectionCard>
  )
}
