"use client"

import { useState } from "react"
import { ChevronDownIcon, HistoryIcon } from "lucide-react"

import type { BusinessVMVHistory } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type VMVVersionCardProps = {
  version: BusinessVMVHistory
}

function formatVersionDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function VMVVersionCard({ version }: VMVVersionCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HistoryIcon className="size-4 text-primary" />
              <p className="font-medium">Version {version.version}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatVersionDate(version.created_at)}
            </p>
            <p className="text-sm text-muted-foreground">
              {version.change_note || "Auto-archived on update"}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? "Hide details" : "View details"}
            <ChevronDownIcon
              className={cn("transition-transform", isOpen && "rotate-180")}
            />
          </Button>
        </div>

        {isOpen ? (
          <div className="mt-4 grid gap-3">
            {[
              { label: "Vision", value: version.vision },
              { label: "Mission", value: version.mission },
              { label: "Values", value: version.values },
            ].map((field) => (
              <div
                key={field.label}
                className="rounded-2xl border border-border/70 bg-muted/20 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {field.label}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                  {field.value || `No ${field.label.toLowerCase()} saved in this version.`}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
