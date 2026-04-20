"use client"

import { useState } from "react"
import { PencilIcon, SaveIcon } from "lucide-react"

import type { BusinessVMV, BusinessVMVUpdate } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type VMVEditorProps = {
  vmv: BusinessVMV | null
  isSaving: boolean
  onSave: (data: BusinessVMVUpdate) => Promise<void>
}

type VMVFormState = {
  vision: string
  mission: string
  values: string
}

function getInitialState(vmv: BusinessVMV | null): VMVFormState {
  return {
    vision: vmv?.vision ?? "",
    mission: vmv?.mission ?? "",
    values: vmv?.values ?? "",
  }
}

export function VMVEditor({ vmv, isSaving, onSave }: VMVEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [values, setValues] = useState<VMVFormState>(() => getInitialState(vmv))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave({
      vision: values.vision,
      mission: values.mission,
      values: values.values,
    })
    setIsEditing(false)
  }

  const hasContent = Boolean(vmv?.vision || vmv?.mission || vmv?.values)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Strategic Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            {vmv ? `Current version: v${vmv.version}` : "Version 1 will be created on first save"}
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <PencilIcon />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="vmv-vision">Vision</Label>
              <Textarea
                id="vmv-vision"
                value={values.vision}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    vision: event.target.value,
                  }))
                }
                placeholder="What future are you building toward?"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vmv-mission">Mission</Label>
              <Textarea
                id="vmv-mission"
                value={values.mission}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    mission: event.target.value,
                  }))
                }
                placeholder="How does this business create value today?"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vmv-values">Values</Label>
              <Textarea
                id="vmv-values"
                value={values.values}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    values: event.target.value,
                  }))
                }
                placeholder="What principles guide decisions and behavior?"
                disabled={isSaving}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValues(getInitialState(vmv))
                  setIsEditing(false)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                <SaveIcon />
                {isSaving ? "Saving..." : "Save Strategic Profile"}
              </Button>
            </div>
          </form>
        ) : hasContent ? (
          <div className="grid gap-4">
            {[
              { label: "Vision", value: vmv?.vision },
              { label: "Mission", value: vmv?.mission },
              { label: "Values", value: vmv?.values },
            ].map((field) => (
              <div
                key={field.label}
                className="rounded-2xl border border-border/70 bg-muted/20 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {field.label}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                  {field.value || `No ${field.label.toLowerCase()} defined yet.`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-sm leading-6 text-muted-foreground">
            No strategic profile set yet. Click Edit to define your vision,
            mission, and values.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
