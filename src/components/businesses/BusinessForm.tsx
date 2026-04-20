"use client"

import { useState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import type { Business } from "@/types/database"
import { businessColorOptions } from "@/components/businesses/business-colors"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type BusinessFormValues = {
  name: string
  description: string
  color: string
}

type BusinessFormSubmitData = {
  name: string
  description: string | null
  color: string
}

type BusinessFormProps = {
  initialValue?: Pick<Business, "name" | "description" | "color">
  submitLabel: string
  onSubmit: (data: BusinessFormSubmitData) => Promise<void>
  onCancel?: () => void
}

function getInitialValue(
  initialValue?: Pick<Business, "name" | "description" | "color">
): BusinessFormValues {
  return {
    name: initialValue?.name ?? "",
    description: initialValue?.description ?? "",
    color: initialValue?.color ?? businessColorOptions[0].value,
  }
}

export function BusinessForm({
  initialValue,
  submitLabel,
  onSubmit,
  onCancel,
}: BusinessFormProps) {
  const [values, setValues] = useState(() => getInitialValue(initialValue))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!values.name.trim()) {
      setError("Business name is required.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim() || null,
        color: values.color,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving the business."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="business-name">Business Name</Label>
        <Input
          id="business-name"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Haverton Homes"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-description">Description</Label>
        <Textarea
          id="business-description"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="What this business does and why it matters."
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-3">
        <Label>Brand Color</Label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {businessColorOptions.map((option) => {
            const isActive = values.color.toLowerCase() === option.value

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex items-center justify-center rounded-xl border border-border/70 p-2 transition-all hover:border-foreground/20",
                  isActive && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                )}
                onClick={() =>
                  setValues((current) => ({ ...current, color: option.value }))
                }
                disabled={isSubmitting}
                aria-label={`Choose ${option.name}`}
                title={option.name}
              >
                <span
                  className="size-6 rounded-full"
                  style={{ backgroundColor: option.value }}
                />
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
          <span
            className="size-5 rounded-full border border-border/70"
            style={{ backgroundColor: values.color }}
          />
          <Input
            value={values.color}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                color: event.target.value,
              }))
            }
            className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
            placeholder="#6366f1"
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
