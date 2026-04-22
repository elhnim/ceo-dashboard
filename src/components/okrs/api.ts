"use client"

import type {
  KeyResult,
  KeyResultInsert,
  KeyResultUpdate,
  Objective,
  ObjectiveInsert,
} from "@/types/okr"

type ApiResult<T> = {
  data: T | null
  error: string | null
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json()) as ApiResult<T>

  if (!response.ok || result.error) {
    throw new Error(result.error || "Request failed")
  }

  return result.data as T
}

export async function fetchObjectives(businessId: string) {
  const response = await fetch(`/api/okrs/objectives?businessId=${businessId}`, {
    cache: "no-store",
  })

  return parseResponse<Objective[]>(response)
}

export async function createObjectiveRequest(payload: ObjectiveInsert) {
  const response = await fetch("/api/okrs/objectives", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return parseResponse<Objective>(response)
}

export async function updateObjectiveRequest(
  id: string,
  payload: Partial<ObjectiveInsert>
) {
  const response = await fetch(`/api/okrs/objectives/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return parseResponse<Objective>(response)
}

export async function deleteObjectiveRequest(id: string) {
  const response = await fetch(`/api/okrs/objectives/${id}`, {
    method: "DELETE",
  })

  return parseResponse<null>(response)
}

export async function createKeyResultRequest(payload: KeyResultInsert) {
  const response = await fetch(
    `/api/okrs/objectives/${payload.objective_id}/key-results`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )

  return parseResponse<KeyResult>(response)
}

export async function updateKeyResultRequest(
  id: string,
  payload: KeyResultUpdate
) {
  const response = await fetch(`/api/okrs/key-results/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return parseResponse<KeyResult>(response)
}

export async function deleteKeyResultRequest(id: string) {
  const response = await fetch(`/api/okrs/key-results/${id}`, {
    method: "DELETE",
  })

  return parseResponse<null>(response)
}
