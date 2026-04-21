import "server-only"

import { Client, GraphError } from "@microsoft/microsoft-graph-client"

export class MicrosoftGraphError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "MicrosoftGraphError"
    this.status = status
  }
}

export function toMicrosoftGraphError(error: unknown): MicrosoftGraphError {
  if (error instanceof MicrosoftGraphError) {
    return error
  }

  if (error instanceof GraphError) {
    return new MicrosoftGraphError(
      error.message || "Microsoft Graph request failed.",
      error.statusCode,
    )
  }

  const message =
    error instanceof Error ? error.message : "Microsoft Graph request failed."

  return new MicrosoftGraphError(message, 500)
}

export function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    },
  })
}
