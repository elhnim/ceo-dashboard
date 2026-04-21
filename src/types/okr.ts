export type OKRStatus = "draft" | "active" | "completed" | "cancelled"

export type OKRCadence = "annual" | "quarterly" | "monthly"

export interface KeyResult {
  id: string
  objective_id: string
  title: string
  description: string | null
  target_value: number
  current_value: number
  unit: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface KeyResultInsert {
  objective_id: string
  title: string
  description?: string | null
  target_value: number
  current_value?: number
  unit?: string
  display_order?: number
}

export interface KeyResultUpdate {
  title?: string
  description?: string | null
  target_value?: number
  current_value?: number
  unit?: string
  display_order?: number
}

export interface Objective {
  id: string
  business_id: string
  title: string
  description: string | null
  status: OKRStatus
  cadence: OKRCadence
  start_date: string | null
  end_date: string | null
  progress: number
  display_order: number
  created_at: string
  updated_at: string
  key_results: KeyResult[]
}

export interface ObjectiveInsert {
  business_id: string
  title: string
  description?: string | null
  status?: OKRStatus
  cadence?: OKRCadence
  start_date?: string | null
  end_date?: string | null
  display_order?: number
}

export interface ObjectiveWithBusiness extends Objective {
  business: {
    name: string
  } | null
}
