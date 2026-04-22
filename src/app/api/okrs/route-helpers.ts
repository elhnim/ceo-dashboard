import type {
  KeyResultInsert,
  KeyResultUpdate,
  ObjectiveInsert,
} from "@/types/okr"
import { OKRSchemaError } from "@/lib/services/okrs"

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object"
}

function parseOptionalString(
  value: unknown,
  message: string
): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error(message)
  }

  return value
}

function parseOptionalNumber(
  value: unknown,
  message: string
): number | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(message)
  }

  return value
}

export function parseObjectiveInsert(value: unknown): ObjectiveInsert {
  if (!isObject(value)) {
    throw new Error("Request body must be an object")
  }

  if (
    typeof value.business_id !== "string" ||
    value.business_id.trim().length === 0
  ) {
    throw new Error("business_id is required")
  }

  if (typeof value.title !== "string" || value.title.trim().length === 0) {
    throw new Error("Objective title is required")
  }

  return {
    business_id: value.business_id,
    title: value.title,
    description: parseOptionalString(
      value.description,
      "Objective description must be a string"
    ),
    status: parseOptionalString(value.status, "Objective status must be a string") as
      | ObjectiveInsert["status"]
      | undefined,
    cadence: parseOptionalString(
      value.cadence,
      "Objective cadence must be a string"
    ) as ObjectiveInsert["cadence"] | undefined,
    start_date: parseOptionalString(
      value.start_date,
      "start_date must be a string"
    ),
    end_date: parseOptionalString(value.end_date, "end_date must be a string"),
    display_order: parseOptionalNumber(
      value.display_order,
      "display_order must be a number"
    ),
  }
}

export function parseObjectiveUpdate(
  value: unknown
): Partial<ObjectiveInsert> {
  if (!isObject(value)) {
    throw new Error("Request body must be an object")
  }

  const parsed: Partial<ObjectiveInsert> = {}

  if (value.title !== undefined) {
    if (typeof value.title !== "string" || value.title.trim().length === 0) {
      throw new Error("Objective title cannot be empty")
    }

    parsed.title = value.title
  }

  if (value.description !== undefined) {
    if (value.description !== null && typeof value.description !== "string") {
      throw new Error("Objective description must be a string")
    }

    parsed.description = value.description ?? ""
  }

  if (value.status !== undefined) {
    if (typeof value.status !== "string") {
      throw new Error("Objective status must be a string")
    }

    parsed.status = value.status as ObjectiveInsert["status"]
  }

  if (value.cadence !== undefined) {
    if (typeof value.cadence !== "string") {
      throw new Error("Objective cadence must be a string")
    }

    parsed.cadence = value.cadence as ObjectiveInsert["cadence"]
  }

  if (value.start_date !== undefined) {
    if (value.start_date !== null && typeof value.start_date !== "string") {
      throw new Error("start_date must be a string")
    }

    parsed.start_date = value.start_date ?? ""
  }

  if (value.end_date !== undefined) {
    if (value.end_date !== null && typeof value.end_date !== "string") {
      throw new Error("end_date must be a string")
    }

    parsed.end_date = value.end_date ?? ""
  }

  if (value.display_order !== undefined) {
    if (
      typeof value.display_order !== "number" ||
      Number.isNaN(value.display_order)
    ) {
      throw new Error("display_order must be a number")
    }

    parsed.display_order = value.display_order
  }

  return parsed
}

export function parseKeyResultInsert(value: unknown): KeyResultInsert {
  if (!isObject(value)) {
    throw new Error("Request body must be an object")
  }

  if (
    typeof value.objective_id !== "string" ||
    value.objective_id.trim().length === 0
  ) {
    throw new Error("objective_id is required")
  }

  if (typeof value.title !== "string" || value.title.trim().length === 0) {
    throw new Error("Key result title is required")
  }

  if (typeof value.target_value !== "number" || Number.isNaN(value.target_value)) {
    throw new Error("target_value must be a number")
  }

  return {
    objective_id: value.objective_id,
    title: value.title,
    description: parseOptionalString(
      value.description,
      "Key result description must be a string"
    ),
    target_value: value.target_value,
    current_value: parseOptionalNumber(
      value.current_value,
      "current_value must be a number"
    ),
    unit: parseOptionalString(value.unit, "unit must be a string"),
    display_order: parseOptionalNumber(
      value.display_order,
      "display_order must be a number"
    ),
  }
}

export function parseKeyResultUpdate(value: unknown): KeyResultUpdate {
  if (!isObject(value)) {
    throw new Error("Request body must be an object")
  }

  return {
    ...(value.title !== undefined
      ? (() => {
          if (typeof value.title !== "string" || value.title.trim().length === 0) {
            throw new Error("Key result title cannot be empty")
          }

          return { title: value.title }
        })()
      : {}),
    ...(value.description !== undefined
      ? (() => {
          if (value.description !== null && typeof value.description !== "string") {
            throw new Error("Key result description must be a string")
          }

          return { description: value.description ?? "" }
        })()
      : {}),
    ...(value.target_value !== undefined
      ? (() => {
          if (
            typeof value.target_value !== "number" ||
            Number.isNaN(value.target_value)
          ) {
            throw new Error("target_value must be a number")
          }

          return { target_value: value.target_value }
        })()
      : {}),
    ...(value.current_value !== undefined
      ? (() => {
          if (
            typeof value.current_value !== "number" ||
            Number.isNaN(value.current_value)
          ) {
            throw new Error("current_value must be a number")
          }

          return { current_value: value.current_value }
        })()
      : {}),
    ...(value.unit !== undefined
      ? (() => {
          if (typeof value.unit !== "string") {
            throw new Error("unit must be a string")
          }

          return { unit: value.unit }
        })()
      : {}),
    ...(value.display_order !== undefined
      ? (() => {
          if (
            typeof value.display_order !== "number" ||
            Number.isNaN(value.display_order)
          ) {
            throw new Error("display_order must be a number")
          }

          return { display_order: value.display_order }
        })()
      : {}),
  }
}

export function getOKRStatusCode(message: string) {
  if (
    message === "Request body must be an object" ||
    message === "business_id is required" ||
    message === "Objective title is required" ||
    message === "Objective title cannot be empty" ||
    message === "Objective description must be a string" ||
    message === "Objective status must be a string" ||
    message === "Objective cadence must be a string" ||
    message === "start_date must be a string" ||
    message === "end_date must be a string" ||
    message === "objective_id is required" ||
    message === "Key result title is required" ||
    message === "Key result title cannot be empty" ||
    message === "Key result description must be a string" ||
    message === "target_value must be a number" ||
    message === "current_value must be a number" ||
    message === "unit must be a string" ||
    message === "display_order must be a number"
  ) {
    return 400
  }

  if (message === "Objective not found" || message === "Key result not found") {
    return 404
  }

  if (message.includes("not found")) {
    return 404
  }

  if (message.includes("OKR tables") || message.includes(OKRSchemaError.name)) {
    return 503
  }

  return 500
}
