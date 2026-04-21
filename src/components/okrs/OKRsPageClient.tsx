"use client"

import { useState } from "react"
import { TargetIcon } from "lucide-react"

import type { Business } from "@/types/database"
import { OKRList } from "@/components/okrs/OKRList"

type OKRsPageClientProps = {
  businesses: Business[]
  loadError: string | null
}

export function OKRsPageClient({ businesses, loadError }: OKRsPageClientProps) {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(
    businesses[0]?.id ?? ""
  )

  if (loadError) {
    return (
      <div className="rounded-[28px] border border-destructive/20 bg-destructive/10 px-6 py-8 text-center text-sm text-destructive">
        {loadError}
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
        <p className="text-base font-medium">No businesses found.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a business first before creating OKRs.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <TargetIcon className="size-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">OKRs</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage objectives and key results across your businesses.
        </p>
      </div>

      {businesses.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {businesses.map((business) => (
            <button
              key={business.id}
              onClick={() => setSelectedBusinessId(business.id)}
              className={[
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                selectedBusinessId === business.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              ].join(" ")}
            >
              {business.name}
            </button>
          ))}
        </div>
      )}

      {selectedBusinessId && (
        <OKRList businessId={selectedBusinessId} />
      )}
    </>
  )
}
