"use client"

import type { ReactNode } from "react"
import { LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SettingsSectionCardProps = {
  title: string
  description: string
  children: ReactNode
  onSave?: () => void
  saveLabel?: string
  saving?: boolean
  actions?: ReactNode
}

export function SettingsSectionCard({
  title,
  description,
  children,
  onSave,
  saveLabel = "Save changes",
  saving = false,
  actions,
}: SettingsSectionCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="max-w-2xl leading-6">
            {description}
          </CardDescription>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          {onSave ? (
            <Button disabled={saving} onClick={onSave}>
              {saving ? <LoaderCircleIcon className="animate-spin" /> : null}
              {saveLabel}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  )
}
