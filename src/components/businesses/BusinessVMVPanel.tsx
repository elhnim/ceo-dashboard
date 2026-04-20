"use client"

import { useState } from "react"
import { toast } from "sonner"

import type {
  BusinessVMV,
  BusinessVMVHistory,
  BusinessVMVUpdate,
} from "@/types/database"
import { VMVEditor } from "@/components/businesses/VMVEditor"
import { VMVHistory } from "@/components/businesses/VMVHistory"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type BusinessVMVPanelProps = {
  businessId: string
  initialVMV: BusinessVMV | null
  initialHistory: BusinessVMVHistory[]
  unavailableMessage?: string | null
}

async function saveVMVRequest(businessId: string, payload: BusinessVMVUpdate) {
  const response = await fetch(`/api/businesses/${businessId}/vmv`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const result = (await response.json()) as {
    data: BusinessVMV | null
    error: string | null
  }

  if (!response.ok || result.error || !result.data) {
    throw new Error(result.error || "Unable to update the strategic profile")
  }

  return result.data
}

async function fetchVMVHistoryRequest(businessId: string) {
  const response = await fetch(`/api/businesses/${businessId}/vmv/history`)
  const result = (await response.json()) as {
    data: BusinessVMVHistory[] | null
    error: string | null
  }

  if (!response.ok || result.error || !result.data) {
    throw new Error(result.error || "Unable to refresh VMV history")
  }

  return result.data
}

export function BusinessVMVPanel({
  businessId,
  initialVMV,
  initialHistory,
  unavailableMessage = null,
}: BusinessVMVPanelProps) {
  const [currentVMV, setCurrentVMV] = useState(initialVMV)
  const [history, setHistory] = useState(initialHistory)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(payload: BusinessVMVUpdate) {
    setIsSaving(true)

    try {
      const updatedVMV = await saveVMVRequest(businessId, payload)
      const updatedHistory = await fetchVMVHistoryRequest(businessId)

      setCurrentVMV(updatedVMV)
      setHistory(updatedHistory)
      toast.success(`Strategic profile updated (v${updatedVMV.version})`)
    } finally {
      setIsSaving(false)
    }
  }

  if (unavailableMessage) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Vision, Mission, Values</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          {unavailableMessage}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <VMVEditor
        key={currentVMV?.updated_at ?? "empty-vmv"}
        vmv={currentVMV}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Version History
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Every update archives the previous strategic profile automatically.
          </p>
        </div>
        <VMVHistory versions={history} />
      </div>
    </div>
  )
}
