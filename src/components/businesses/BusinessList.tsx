"use client"

import { useMemo, useState } from "react"
import { PlusIcon } from "lucide-react"

import type { Business, BusinessInsert } from "@/types/database"
import { BusinessCard } from "@/components/businesses/BusinessCard"
import { BusinessForm } from "@/components/businesses/BusinessForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type BusinessListProps = {
  initialBusinesses: Business[]
}

async function createBusinessRequest(payload: BusinessInsert) {
  const response = await fetch("/api/businesses", {
    method: "POST",
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
    throw new Error(result.error || "Unable to create business")
  }

  return result.data
}

export function BusinessList({ initialBusinesses }: BusinessListProps) {
  const [businesses, setBusinesses] = useState(initialBusinesses)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const hasBusinesses = businesses.length > 0
  const businessCountLabel = useMemo(() => {
    if (businesses.length === 1) {
      return "1 active business"
    }

    return `${businesses.length} active businesses`
  }, [businesses.length])

  async function handleCreateBusiness(payload: BusinessInsert) {
    const business = await createBusinessRequest(payload)

    setBusinesses((current) =>
      [...current, business].sort(
        (left, right) => left.display_order - right.display_order
      )
    )
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/60 p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Business configuration
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Businesses
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Capture the strategic home for each company so future OKRs, VMV,
            and performance modules have the right context.
          </p>
          <p className="text-sm text-muted-foreground">{businessCountLabel}</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger render={<Button size="lg" />}>
            <PlusIcon />
            Add Business
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Add a New Business</DialogTitle>
              <DialogDescription>
                Give the dashboard a name, a short description, and a color so
                it can stand out across modules.
              </DialogDescription>
            </DialogHeader>
            <BusinessForm
              submitLabel="Create Business"
              onSubmit={handleCreateBusiness}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </section>

      {hasBusinesses ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </section>
      ) : (
        <section className="rounded-[28px] border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">
            No businesses yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Add your first business to start shaping the dashboard around your
            portfolio, strategic context, and company-specific planning.
          </p>
          <Button
            size="lg"
            className="mt-6"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusIcon />
            Add your first business
          </Button>
        </section>
      )}
    </div>
  )
}
