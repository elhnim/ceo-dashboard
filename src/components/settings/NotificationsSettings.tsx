"use client"

import { PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
import type { AppSettings } from "@/types/settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type NotificationsSettingsProps = {
  config: AppSettings["notificationsConfig"]
  onChange: (config: AppSettings["notificationsConfig"]) => void
  onSave: () => void
  saving: boolean
}

const moduleLabels: Array<keyof Omit<AppSettings["notificationsConfig"], "batchTimes">> =
  ["calendar", "tasks", "email", "okrs"]

export function NotificationsSettings({
  config,
  onChange,
  onSave,
  saving,
}: NotificationsSettingsProps) {
  const [batchTime, setBatchTime] = useState("")

  return (
    <SettingsSectionCard
      description="Choose which modules can notify you and define digest batch windows."
      onSave={onSave}
      saving={saving}
      title="Notifications"
    >
      <div className="space-y-2">
        {moduleLabels.map((module) => (
          <div
            key={module}
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4"
          >
            <div>
              <p className="font-medium capitalize">{module}</p>
              <p className="text-sm text-muted-foreground">
                Enable batched notifications for {module}.
              </p>
            </div>
            <Switch
              checked={config[module]}
              onCheckedChange={(checked) =>
                onChange({ ...config, [module]: checked })
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="font-medium">Batch times</p>
        <div className="flex gap-2">
          <Input
            onChange={(event) => setBatchTime(event.target.value)}
            type="time"
            value={batchTime}
          />
          <Button
            onClick={() => {
              if (!batchTime || config.batchTimes.includes(batchTime)) {
                return
              }

              onChange({
                ...config,
                batchTimes: [...config.batchTimes, batchTime].sort(),
              })
              setBatchTime("")
            }}
            type="button"
            variant="outline"
          >
            <PlusIcon />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.batchTimes.map((time) => (
            <Badge key={time} variant="outline">
              {time}
              <button
                className="ml-1"
                onClick={() =>
                  onChange({
                    ...config,
                    batchTimes: config.batchTimes.filter((entry) => entry !== time),
                  })
                }
                type="button"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </SettingsSectionCard>
  )
}
