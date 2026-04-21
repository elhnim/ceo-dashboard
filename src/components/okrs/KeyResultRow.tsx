"use client"

import { useState } from "react"
import { PencilIcon, Trash2Icon } from "lucide-react"

import type { KeyResult } from "@/types/okr"
import { OKRProgressBar } from "@/components/okrs/OKRProgressBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type KeyResultRowProps = {
  keyResult: KeyResult
  onUpdate: (id: string, currentValue: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function getKeyResultProgress(keyResult: KeyResult) {
  if (keyResult.target_value <= 0) {
    return 0
  }

  return Math.max(
    0,
    Math.min(100, (keyResult.current_value / keyResult.target_value) * 100)
  )
}

function formatMetric(keyResult: KeyResult) {
  return `${keyResult.current_value} / ${keyResult.target_value} ${keyResult.unit}`.trim()
}

export function KeyResultRow({
  keyResult,
  onUpdate,
  onDelete,
}: KeyResultRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(String(keyResult.current_value))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave() {
    const parsedValue = Number(value)

    if (Number.isNaN(parsedValue)) {
      setError("Enter a valid number.")
      return
    }

    if (parsedValue === keyResult.current_value) {
      setIsEditing(false)
      setError(null)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onUpdate(keyResult.id, parsedValue)
      setIsEditing(false)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update the key result."
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      await onDelete(keyResult.id)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the key result."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{keyResult.title}</p>
          <p className="text-sm text-muted-foreground">{formatMetric(keyResult)}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              type="number"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={() => void handleSave()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void handleSave()
                }

                if (event.key === "Escape") {
                  setValue(String(keyResult.current_value))
                  setIsEditing(false)
                  setError(null)
                }
              }}
              className="h-9 w-28"
              autoFocus
              disabled={isSaving}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setValue(String(keyResult.current_value))
                setIsEditing(true)
              }}
              disabled={isDeleting}
            >
              <PencilIcon />
              Update
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void handleDelete()}
            disabled={isDeleting || isSaving}
            aria-label={`Delete ${keyResult.title}`}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(getKeyResultProgress(keyResult))}%</span>
        </div>
        <OKRProgressBar value={getKeyResultProgress(keyResult)} />
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
