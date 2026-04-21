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

type TasksSettingsProps = {
  config: AppSettings["tasksConfig"]
  onChange: (config: AppSettings["tasksConfig"]) => void
  onSave: () => void
  saving: boolean
}

export function TasksSettings({
  config,
  onChange,
  onSave,
  saving,
}: TasksSettingsProps) {
  return (
    <SettingsSectionCard
      description="Tune the default prioritisation logic for the Do This Next workflow."
      onSave={onSave}
      saving={saving}
      title="Tasks"
    >
      <div className="space-y-2">
        <Label>Do This Next algorithm</Label>
        <Select
          value={config.doThisNextAlgorithm}
          onValueChange={(value) =>
            onChange({
              ...config,
              doThisNextAlgorithm:
                value as AppSettings["tasksConfig"]["doThisNextAlgorithm"],
            })
          }
        >
          <SelectTrigger className="w-full md:max-w-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="importance_then_due_date">
              Importance then due date
            </SelectItem>
            <SelectItem value="due_date_first">Due date first</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div>
          <p className="font-medium">Include tasks in EA Briefing</p>
          <p className="text-sm text-muted-foreground">
            Surface task context in the generated morning brief.
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
