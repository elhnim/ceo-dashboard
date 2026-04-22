"use client"

import { RefreshCwIcon, SparklesIcon, ZapIcon } from "lucide-react"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
import type { AppSettings } from "@/types/settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type BriefingSettingsProps = {
  config: AppSettings["briefingConfig"]
  onChange: (config: AppSettings["briefingConfig"]) => void
  onRunAction: (action: "sync" | "generate" | "full") => void
  runningAction: "sync" | "generate" | "full" | null
  onSave: () => void
  saving: boolean
}

const sectionLabels: Array<{
  key: keyof AppSettings["briefingConfig"]["sections"]
  label: string
}> = [
  { key: "focus", label: "Focus" },
  { key: "calendar", label: "Calendar" },
  { key: "tasks", label: "Tasks" },
  { key: "email", label: "Email" },
  { key: "teams", label: "Teams" },
  { key: "okrs", label: "OKRs" },
]

function updateSection(
  sections: AppSettings["briefingConfig"]["sections"],
  key: keyof AppSettings["briefingConfig"]["sections"],
  patch: Partial<
    AppSettings["briefingConfig"]["sections"][keyof AppSettings["briefingConfig"]["sections"]]
  >
) {
  return {
    ...sections,
    [key]: {
      ...sections[key],
      ...patch,
    },
  }
}

export function BriefingSettings({
  config,
  onChange,
  onRunAction,
  runningAction,
  onSave,
  saving,
}: BriefingSettingsProps) {
  function handleModelChange(value: string | null) {
    if (!value) {
      return
    }

    onChange({ ...config, model: value })
  }

  function handleSectionFormatChange(
    key: keyof AppSettings["briefingConfig"]["sections"],
    value: string | null
  ) {
    if (value !== "narrative" && value !== "structured") {
      return
    }

    onChange({
      ...config,
      sections: updateSection(config.sections, key, {
        format: value,
      }),
    })
  }

  return (
    <SettingsSectionCard
      actions={
        <>
          <Button
            disabled={runningAction !== null}
            onClick={() => onRunAction("sync")}
            type="button"
            variant="outline"
          >
            <RefreshCwIcon />
            Re-sync all modules now
          </Button>
          <Button
            disabled={runningAction !== null}
            onClick={() => onRunAction("generate")}
            type="button"
            variant="outline"
          >
            <SparklesIcon />
            Regenerate brief now
          </Button>
          <Button
            disabled={runningAction !== null}
            onClick={() => onRunAction("full")}
            type="button"
            variant="outline"
          >
            <ZapIcon />
            Re-sync + Regenerate
          </Button>
        </>
      }
      description="Configure the EA briefing schedule, section formats, and manual refresh controls."
      onSave={onSave}
      saving={saving}
      title="EA Briefing"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Schedule time</Label>
          <Input
            onChange={(event) =>
              onChange({ ...config, scheduleTime: event.target.value })
            }
            type="time"
            value={config.scheduleTime}
          />
        </div>
        <div className="space-y-2">
          <Label>Second run time</Label>
          <Input
            onChange={(event) =>
              onChange({
                ...config,
                secondRunTime: event.target.value || null,
              })
            }
            type="time"
            value={config.secondRunTime ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Timezone</Label>
          <div className="flex h-8 items-center rounded-xl border border-border/70 bg-muted/20 px-3">
            <Badge variant="outline">{config.timezone}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={config.model} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude-sonnet-4-6">Sonnet</SelectItem>
              <SelectItem value="claude-opus-4-1">Opus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Per-section config</Label>
        {sectionLabels.map(({ key, label }) => (
          <div
            key={key}
            className="grid gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[1fr_160px_120px]"
          >
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">
                Control whether this section appears in the generated brief.
              </p>
            </div>
            <Select
              value={config.sections[key].format}
              onValueChange={(value) => handleSectionFormatChange(key, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrative">Narrative</SelectItem>
                <SelectItem value="structured">Structured</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex h-8 items-center justify-between rounded-xl border border-border/70 bg-background px-3">
              <span className="text-sm text-muted-foreground">
                {config.sections[key].enabled ? "Enabled" : "Disabled"}
              </span>
              <Switch
                checked={config.sections[key].enabled}
                onCheckedChange={(checked) =>
                  onChange({
                    ...config,
                    sections: updateSection(config.sections, key, {
                      enabled: checked,
                    }),
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </SettingsSectionCard>
  )
}
