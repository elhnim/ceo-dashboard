"use client"

import { useEffect, useState } from "react"

import type { Email, EmailAction } from "@/types/email"

type UseEmailsOptions = {
  initialEmails?: Email[]
}

async function fetchEmailsRequest() {
  const response = await fetch("/api/email", {
    cache: "no-store",
  })
  const result = (await response.json()) as {
    emails?: Email[]
    error?: string
  }

  if (!response.ok) {
    throw new Error(result.error || "Unable to load emails")
  }

  return result.emails ?? []
}

async function syncEmailsRequest() {
  const response = await fetch("/api/email/sync", {
    method: "POST",
  })
  const result = (await response.json()) as {
    ok?: boolean
    error?: string
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Unable to sync emails")
  }
}

async function actOnEmailRequest(id: string, action: EmailAction) {
  const response = await fetch(`/api/email/${encodeURIComponent(id)}/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  })
  const result = (await response.json()) as {
    ok?: boolean
    error?: string
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Unable to update email")
  }
}

export function useEmails({ initialEmails = [] }: UseEmailsOptions = {}) {
  const [emails, setEmails] = useState(initialEmails)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(initialEmails.length === 0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [actioningIds, setActioningIds] = useState<Record<string, EmailAction>>(
    {},
  )

  useEffect(() => {
    setEmails(initialEmails)

    if (initialEmails.length > 0) {
      setIsLoading(false)
    }
  }, [initialEmails])

  useEffect(() => {
    if (initialEmails.length > 0) {
      return
    }

    let isCancelled = false
    setIsLoading(true)

    void fetchEmailsRequest()
      .then((nextEmails) => {
        if (isCancelled) {
          return
        }

        setEmails(nextEmails)
        setError(null)
      })
      .catch((nextError: unknown) => {
        if (isCancelled) {
          return
        }

        setError(
          nextError instanceof Error ? nextError.message : "Unable to load emails",
        )
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [initialEmails.length])

  async function refresh() {
    setIsLoading(true)

    try {
      const nextEmails = await fetchEmailsRequest()
      setEmails(nextEmails)
      setError(null)
      return nextEmails
    } finally {
      setIsLoading(false)
    }
  }

  async function sync() {
    setIsSyncing(true)
    setError(null)

    try {
      await syncEmailsRequest()
      await refresh()
    } catch (nextError) {
      const message =
        nextError instanceof Error ? nextError.message : "Unable to sync emails"
      setError(message)
      throw nextError
    } finally {
      setIsSyncing(false)
    }
  }

  async function act(id: string, action: EmailAction): Promise<void> {
    const previousEmails = emails
    setActioningIds((current) => ({ ...current, [id]: action }))
    setError(null)
    setEmails((current) => current.filter((email) => email.id !== id))

    try {
      await actOnEmailRequest(id, action)
    } catch (nextError) {
      setEmails(previousEmails)
      const message =
        nextError instanceof Error ? nextError.message : "Unable to update email"
      setError(message)
      throw nextError
    } finally {
      setActioningIds((current) => {
        const nextState = { ...current }
        delete nextState[id]
        return nextState
      })
    }
  }

  return {
    emails,
    error,
    isLoading,
    isSyncing,
    actioningIds,
    refresh,
    sync,
    act,
  }
}
