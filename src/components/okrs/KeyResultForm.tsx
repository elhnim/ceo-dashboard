"use client"

import { useState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import type { KeyResultInsert } from "@/types/okr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type KeyResultFormProps = {
  objectiveId: string
  onSubmit: (data: KeyResultInsert) => Promise<void>
  onCancel?: () => void
}

type KeyResultFormValues = {
  title: string
  target_value: string
  current_value: string
  unit: string
}

export function KeyResultForm({
  objectiveId,
  onSubmit,
  onCancel,
}: KeyResultFormProps) {
  const [values, setValues] = useState<KeyResultFormValues>({
    title: "",
    target_value: "100",
    current_value: "0",
    unit: "%",
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!values.title.trim()) {
      setError("Key result title is required.")
      return
    }

    const targetValue = Number(values.target_value)
    const currentValue = Number(values.current_value)

    if (Number.isNaN(targetValue) || Number.isNaN(currentValue)) {
      setError("Target and current values must be valid numbers.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        objective_id: objectiveId,
        title: values.title.trim(),
        target_value: targetValue,
        current_value: currentValue,
        unit: values.unit.trim() || "%",
      })
      setValues({
        title: "",
        target_value: "100",
        current_value: "0",
        unit: "%",
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the key result."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor={`key-result-title-${objectiveId}`}>Key Result</Label>
        <Input
          id={`key-result-title-${objectiveId}`}
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Monthly recurring revenue"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`key-result-current-${objectiveId}`}>Current</Label>
          <Input
            id={`key-result-current-${objectiveId}`}
            type="number"
            value={values.current_value}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                current_value: event.target.value,
              }))
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`key-result-target-${objectiveId}`}>Target</Label>
          <Input
            id={`key-result-target-${objectiveId}`}
            type="number"
            value={values.target_value}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                target_value: event.target.value,
              }))
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`key-result-unit-${objectiveId}`}>Unit</Label>
          <Input
            id={`key-result-unit-${objectiveId}`}
            value={values.unit}
            onChange={(event) =>
              setValues((current) => ({ ...current, unit: event.target.value }))
            }
            placeholder="%"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
          Add Key Result
        </Button>
      </div>
    </form>
  )
}
