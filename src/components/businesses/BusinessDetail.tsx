"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PencilIcon, Trash2Icon } from "lucide-react"

import type { Business, BusinessUpdate } from "@/types/database"
import { BusinessForm } from "@/components/businesses/BusinessForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type BusinessDetailProps = {
  business: Business
}

async function updateBusinessRequest(id: string, payload: BusinessUpdate) {
  const response = await fetch(`/api/businesses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const result = (await response.json()) as {
    data: Business | null
    error: string | null
  }

  if (!response.ok || result.error || !result.data) {
    throw new Error(result.error || "Unable to update business")
  }

  return result.data
}

async function deleteBusinessRequest(id: string) {
  const response = await fetch(`/api/businesses/${id}`, {
    method: "DELETE",
  })

  const result = (await response.json()) as {
    data: null
    error: string | null
  }

  if (!response.ok || result.error) {
    throw new Error(result.error || "Unable to delete business")
  }
}

export function BusinessDetail({ business }: BusinessDetailProps) {
  const router = useRouter()
  const [currentBusiness, setCurrentBusiness] = useState(business)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleUpdateBusiness(payload: BusinessUpdate) {
    const updatedBusiness = await updateBusinessRequest(currentBusiness.id, payload)
    setCurrentBusiness(updatedBusiness)
    setIsEditDialogOpen(false)
    router.refresh()
  }

  async function handleDeleteBusiness() {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteBusinessRequest(currentBusiness.id)
      router.push("/businesses")
      router.refresh()
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete the business right now."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/60 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className="size-4 rounded-full border border-border/70"
                style={{ backgroundColor: currentBusiness.color }}
              />
              <Badge variant="outline">Active business</Badge>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {currentBusiness.name}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {currentBusiness.description ||
                  "No description yet. Add operating context so future OKRs and VMV work have the right frame."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="lg" onClick={() => setIsEditDialogOpen(true)}>
              <PencilIcon />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2Icon />
              Delete
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview" className="gap-6">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vmv">VMV</TabsTrigger>
          <TabsTrigger value="okrs">OKRs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Business Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground/90">
                  {currentBusiness.description || "No description captured yet."}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Brand Color
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className="size-8 rounded-full border border-border/70"
                    style={{ backgroundColor: currentBusiness.color }}
                  />
                  <span className="text-sm font-medium">
                    {currentBusiness.color.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vmv">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Vision, Mission, Values</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              Coming soon. This tab will hold the evolving strategic identity for
              this business.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="okrs">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Objectives and Key Results</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              Coming soon. This tab will become the operating cockpit for
              business-level OKRs.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>
              Update the business identity, description, and color.
            </DialogDescription>
          </DialogHeader>
          <BusinessForm
            initialValue={currentBusiness}
            submitLabel="Save Changes"
            onSubmit={handleUpdateBusiness}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {currentBusiness.name}?</DialogTitle>
            <DialogDescription>
              This removes the business from active use in the dashboard. You can
              keep it out of the way without touching related history later.
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
              onClick={handleDeleteBusiness}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Business"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
