"use client"

import { useState } from "react"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import type { KeyResultInsert, Objective, ObjectiveInsert } from "@/types/okr"
import { KeyResultForm } from "@/components/okrs/KeyResultForm"
import { KeyResultRow } from "@/components/okrs/KeyResultRow"
import { OKRForm } from "@/components/okrs/OKRForm"
import { OKRProgressBar } from "@/components/okrs/OKRProgressBar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type OKRCardProps = {
  objective: Objective
  onUpdateObjective: (
    id: string,
    payload: Partial<ObjectiveInsert>
  ) => Promise<void>
  onDeleteObjective: (id: string) => Promise<void>
  onCreateKeyResult: (payload: KeyResultInsert) => Promise<void>
  onUpdateKeyResult: (id: string, currentValue: number) => Promise<void>
  onDeleteKeyResult: (id: string) => Promise<void>
}

function formatBadgeLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function OKRCard({
  objective,
  onUpdateObjective,
  onDeleteObjective,
  onCreateKeyResult,
  onUpdateKeyResult,
  onDeleteKeyResult,
}: OKRCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddingKeyResult, setIsAddingKeyResult] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteObjective() {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await onDeleteObjective(objective.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete the objective."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <button
              type="button"
              className="flex flex-1 items-start gap-3 text-left"
              onClick={() => setIsExpanded((current) => !current)}
            >
              <span className="mt-1 rounded-full border border-border/70 p-1 text-muted-foreground">
                {isExpanded ? (
                  <ChevronDownIcon className="size-4" />
                ) : (
                  <ChevronRightIcon className="size-4" />
                )}
              </span>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {objective.title}
                    </h3>
                    <Badge variant="secondary">
                      {formatBadgeLabel(objective.cadence)}
                    </Badge>
                    <Badge variant="outline">
                      {formatBadgeLabel(objective.status)}
                    </Badge>
                  </div>
                  {objective.description ? (
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {objective.description}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{objective.key_results?.length ?? 0} key results</span>
                    <span>{Math.round(objective.progress)}%</span>
                  </div>
                  <OKRProgressBar value={objective.progress} />
                </div>
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsAddingKeyResult((current) => !current)
                  setIsExpanded(true)
                }}
              >
                <PlusIcon />
                Key Result
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsEditDialogOpen(true)
                }}
              >
                <PencilIcon />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsDeleteDialogOpen(true)
                }}
                aria-label={`Delete ${objective.title}`}
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>

          {isExpanded ? (
            <div className="space-y-4 border-t border-border/70 pt-5">
              {isAddingKeyResult ? (
                <KeyResultForm
                  objectiveId={objective.id}
                  onSubmit={async (payload) => {
                    await onCreateKeyResult(payload)
                    setIsAddingKeyResult(false)
                    setIsExpanded(true)
                  }}
                  onCancel={() => setIsAddingKeyResult(false)}
                />
              ) : null}

              {objective.key_results && objective.key_results.length > 0 ? (
                <div className="space-y-3">
                  {objective.key_results.map((keyResult) => (
                    <KeyResultRow
                      key={keyResult.id}
                      keyResult={keyResult}
                      onUpdate={onUpdateKeyResult}
                      onDelete={onDeleteKeyResult}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  No key results yet. Add the first measurable result for this
                  objective.
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Objective</DialogTitle>
            <DialogDescription>
              Update the objective details, timeline, and current status.
            </DialogDescription>
          </DialogHeader>
          <OKRForm
            businessId={objective.business_id}
            initialValue={objective}
            submitLabel="Save Changes"
            onSubmit={async (payload) => {
              await onUpdateObjective(objective.id, payload)
              setIsEditDialogOpen(false)
            }}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {objective.title}?</DialogTitle>
            <DialogDescription>
              This permanently removes the objective and its key results.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </div>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteObjective()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Objective"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
