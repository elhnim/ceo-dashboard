"use client"

import { LoaderCircleIcon, LogInIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function MicrosoftSignInButton() {
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        size="lg"
        onClick={() => {
          setErrorMessage(null)
          startTransition(async () => {
            try {
              await signIn("microsoft-entra-id", { redirectTo: "/" })
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Unable to start Microsoft sign-in.",
              )
            }
          })
        }}
      >
        {isPending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <LogInIcon />
        )}
        Sign in with Microsoft
      </Button>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
