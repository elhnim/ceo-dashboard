"use client"

import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"

import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard"
import { COMMON_TIMEZONES } from "@/components/settings/options"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type GeneralSettingsProps = {
  timezone: string
  userEmail: string
  userName: string | null
  onTimezoneChange: (value: string) => void
  onSave: () => void
  saving: boolean
}

export function GeneralSettings({
  timezone,
  userEmail,
  userName,
  onTimezoneChange,
  onSave,
  saving,
}: GeneralSettingsProps) {
  const { theme = "system", setTheme } = useTheme()

  return (
    <SettingsSectionCard
      description="Set the default timezone for briefings and control the global display theme."
      onSave={onSave}
      saving={saving}
      title="General"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select
            value={timezone}
            onValueChange={(value) => {
              if (value) {
                onTimezoneChange(value)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            value={theme}
            onValueChange={(value) => {
              if (value) {
                setTheme(value)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{userName?.trim() || "Microsoft account"}</p>
          <Badge variant="outline">Connected</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{userEmail}</p>
        <Button
          className="mt-4"
          onClick={async () => {
            await signOut({ callbackUrl: "/login" })
          }}
          variant="outline"
        >
          Disconnect
        </Button>
      </div>
    </SettingsSectionCard>
  )
}
