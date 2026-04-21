"use client"

import { PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
import { LOOKBACK_OPTIONS } from "@/components/settings/options"
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

type EmailSettingsProps = {
  config: AppSettings["emailConfig"]
  onChange: (config: AppSettings["emailConfig"]) => void
  onSave: () => void
  saving: boolean
}

export function EmailSettings({
  config,
  onChange,
  onSave,
  saving,
}: EmailSettingsProps) {
  const [keywordInput, setKeywordInput] = useState("")

  return (
    <SettingsSectionCard
      description="Set the urgency window and keywords used to highlight important email."
      onSave={onSave}
      saving={saving}
      title="Email"
    >
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

      <div className="space-y-3">
        <Label>Urgent keywords</Label>
        <div className="flex gap-2">
          <Input
            onChange={(event) => setKeywordInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") {
                return
              }

              event.preventDefault()
              const nextKeyword = keywordInput.trim()

              if (!nextKeyword) {
                return
              }

              if (!config.urgentKeywords.includes(nextKeyword)) {
                onChange({
                  ...config,
                  urgentKeywords: [...config.urgentKeywords, nextKeyword],
                })
              }

              setKeywordInput("")
            }}
            placeholder="Add keyword"
            value={keywordInput}
          />
          <Button
            onClick={() => {
              const nextKeyword = keywordInput.trim()

              if (!nextKeyword || config.urgentKeywords.includes(nextKeyword)) {
                return
              }

              onChange({
                ...config,
                urgentKeywords: [...config.urgentKeywords, nextKeyword],
              })
              setKeywordInput("")
            }}
            type="button"
            variant="outline"
          >
            <PlusIcon />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.urgentKeywords.length > 0 ? (
            config.urgentKeywords.map((keyword) => (
              <Badge key={keyword} variant="outline">
                {keyword}
                <button
                  className="ml-1"
                  onClick={() =>
                    onChange({
                      ...config,
                      urgentKeywords: config.urgentKeywords.filter(
                        (entry) => entry !== keyword
                      ),
                    })
                  }
                  type="button"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No urgent keywords configured yet.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div>
          <p className="font-medium">Include email in EA Briefing</p>
          <p className="text-sm text-muted-foreground">
            Pull urgent inbox context into the generated brief.
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
