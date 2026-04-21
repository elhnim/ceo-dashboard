"use client"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
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

type OKRsSettingsProps = {
  config: AppSettings["okrsConfig"]
  onChange: (config: AppSettings["okrsConfig"]) => void
  onSave: () => void
  saving: boolean
}

export function OKRsSettings({
  config,
  onChange,
  onSave,
  saving,
}: OKRsSettingsProps) {
  return (
    <SettingsSectionCard
      description="Choose the cadence and progress method used for strategic tracking."
      onSave={onSave}
      saving={saving}
      title="OKRs"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>OKR cycle</Label>
          <Select
            value={config.cadence}
            onValueChange={(value) =>
              onChange({
                ...config,
                cadence: value as AppSettings["okrsConfig"]["cadence"],
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Progress tracking</Label>
          <Select
            value={config.progressMethod}
            onValueChange={(value) =>
              onChange({
                ...config,
                progressMethod:
                  value as AppSettings["okrsConfig"]["progressMethod"],
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual_percentage">Manual %</SelectItem>
              <SelectItem value="milestone_based">Milestone-based</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div>
          <p className="font-medium">Include OKRs in EA Briefing</p>
          <p className="text-sm text-muted-foreground">
            Keep strategic objectives visible inside the morning brief.
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
