"use client"

import { useState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import type { Objective, ObjectiveInsert } from "@/types/okr"
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
import { Textarea } from "@/components/ui/textarea"

type OKRFormProps = {
  businessId: string
  initialValue?: Objective
  submitLabel: string
  onSubmit: (data: ObjectiveInsert) => Promise<void>
  onCancel?: () => void
}

type OKRFormValues = {
  title: string
  description: string
  cadence: ObjectiveInsert["cadence"]
  status: ObjectiveInsert["status"]
  start_date: string
  end_date: string
}

function getInitialValue(initialValue?: Objective): OKRFormValues {
  return {
    title: initialValue?.title ?? "",
    description: initialValue?.description ?? "",
    cadence: initialValue?.cadence ?? "quarterly",
    status: initialValue?.status ?? "draft",
    start_date: initialValue?.start_date ?? "",
    end_date: initialValue?.end_date ?? "",
  }
}

export function OKRForm({
  businessId,
  initialValue,
  submitLabel,
  onSubmit,
  onCancel,
}: OKRFormProps) {
  const [values, setValues] = useState(() => getInitialValue(initialValue))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!values.title.trim()) {
      setError("Objective title is required.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        business_id: businessId,
        title: values.title.trim(),
        description: values.description,
        cadence: values.cadence,
        status: values.status,
        start_date: values.start_date,
        end_date: values.end_date,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the objective right now."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="objective-title">Title</Label>
        <Input
          id="objective-title"
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Launch the next growth engine"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="objective-description">Description</Label>
        <Textarea
          id="objective-description"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="Add context for what success looks like."
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Cadence</Label>
          <Select
            value={values.cadence}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                cadence: value as OKRFormValues["cadence"],
              }))
            }
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select cadence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={values.status}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                status: value as OKRFormValues["status"],
              }))
            }
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="objective-start-date">Start Date</Label>
          <Input
            id="objective-start-date"
            type="date"
            value={values.start_date}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                start_date: event.target.value,
              }))
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective-end-date">End Date</Label>
          <Input
            id="objective-end-date"
            type="date"
            value={values.end_date}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                end_date: event.target.value,
              }))
            }
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
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
