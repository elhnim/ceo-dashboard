"use client"

import { useEffect, useState } from "react"
import { PlusIcon, RefreshCcwIcon, TargetIcon } from "lucide-react"

import type { KeyResultInsert, Objective, ObjectiveInsert } from "@/types/okr"
import {
  createKeyResultRequest,
  createObjectiveRequest,
  deleteKeyResultRequest,
  deleteObjectiveRequest,
  fetchObjectives,
  updateKeyResultRequest,
  updateObjectiveRequest,
} from "@/components/okrs/api"
import { OKRCard } from "@/components/okrs/OKRCard"
import { OKRForm } from "@/components/okrs/OKRForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type OKRListProps = {
  businessId: string
}

export function OKRList({ businessId }: OKRListProps) {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  async function refreshObjectives(showLoading = false) {
    if (showLoading) {
      setIsLoading(true)
    }

    try {
      setError(null)
      const nextObjectives = await fetchObjectives(businessId)
      setObjectives(nextObjectives)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load objectives."
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadObjectives() {
      try {
        const nextObjectives = await fetchObjectives(businessId)

        if (cancelled) {
          return
        }

        setError(null)
        setObjectives(nextObjectives)
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load objectives."
        )
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadObjectives()

    return () => {
      cancelled = true
    }
  }, [businessId])

  async function handleCreateObjective(payload: ObjectiveInsert) {
    await createObjectiveRequest(payload)
    await refreshObjectives()
    setIsCreateDialogOpen(false)
  }

  async function handleUpdateObjective(
    id: string,
    payload: Partial<ObjectiveInsert>
  ) {
    await updateObjectiveRequest(id, payload)
    await refreshObjectives()
  }

  async function handleDeleteObjective(id: string) {
    await deleteObjectiveRequest(id)
    await refreshObjectives()
  }

  async function handleCreateKeyResult(payload: KeyResultInsert) {
    await createKeyResultRequest(payload)
    await refreshObjectives()
  }

  async function handleUpdateKeyResult(id: string, currentValue: number) {
    await updateKeyResultRequest(id, { current_value: currentValue })
    await refreshObjectives()
  }

  async function handleDeleteKeyResult(id: string) {
    await deleteKeyResultRequest(id)
    await refreshObjectives()
  }

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="size-5 text-primary" />
              Objectives and Key Results
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track the strategic outcomes for this business and the measures
              that move them forward.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void refreshObjectives()}
              disabled={isLoading}
            >
              <RefreshCcwIcon />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon />
              Add Objective
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-28 rounded-2xl bg-muted/40" />
              <div className="h-28 rounded-2xl bg-muted/30" />
            </div>
          ) : objectives.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
              <p className="text-base font-medium">No objectives yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first OKR.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {objectives.map((objective) => (
                <OKRCard
                  key={objective.id}
                  objective={objective}
                  onUpdateObjective={handleUpdateObjective}
                  onDeleteObjective={handleDeleteObjective}
                  onCreateKeyResult={handleCreateKeyResult}
                  onUpdateKeyResult={handleUpdateKeyResult}
                  onDeleteKeyResult={handleDeleteKeyResult}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Objective</DialogTitle>
            <DialogDescription>
              Define a business objective, set the cadence, and choose the
              current status.
            </DialogDescription>
          </DialogHeader>
          <OKRForm
            businessId={businessId}
            submitLabel="Create Objective"
            onSubmit={handleCreateObjective}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
