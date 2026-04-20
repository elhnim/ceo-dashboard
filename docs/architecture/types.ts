// CEO Dashboard — TypeScript Type Definitions
// These types match the Supabase schema and are used across the app
// Codex: copy these to src/types/ when implementing

// ============================================
// BUSINESS
// ============================================

export interface Business {
  id: string
  name: string
  description: string | null
  color: string
  logo_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BusinessInsert {
  name: string
  description?: string | null
  color?: string
  logo_url?: string | null
  display_order?: number
  is_active?: boolean
}

export interface BusinessUpdate {
  name?: string
  description?: string | null
  color?: string
  logo_url?: string | null
  display_order?: number
  is_active?: boolean
}

// ============================================
// VISION / MISSION / VALUES
// ============================================

export interface BusinessVMV {
  id: string
  business_id: string
  vision: string | null
  mission: string | null
  values: string | null
  version: number
  created_at: string
  updated_at: string
}

export interface BusinessVMVHistory {
  id: string
  business_id: string
  vision: string | null
  mission: string | null
  values: string | null
  version: number
  change_note: string | null
  created_at: string
}

export interface BusinessVMVUpdate {
  vision?: string | null
  mission?: string | null
  values?: string | null
}

// ============================================
// OKRs
// ============================================

export type OKRStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type OKRCadence = 'annual' | 'quarterly' | 'monthly'

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

export interface ObjectiveUpdate {
  title?: string
  description?: string | null
  status?: OKRStatus
  cadence?: OKRCadence
  start_date?: string | null
  end_date?: string | null
  display_order?: number
}

export interface ObjectiveWithKeyResults extends Objective {
  key_results: KeyResult[]
}

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
  target_value?: number
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

// ============================================
// DAILY RITUALS
// ============================================

export interface DailyPriorities {
  id: string
  date: string
  priority_1: string | null
  priority_2: string | null
  priority_3: string | null
  do_this_next: string | null
  completed_items: string[]
  reflection: string | null
  created_at: string
  updated_at: string
}

export interface DailyPrioritiesUpsert {
  date: string
  priority_1?: string | null
  priority_2?: string | null
  priority_3?: string | null
  do_this_next?: string | null
  completed_items?: string[]
  reflection?: string | null
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResult<T> = ApiResponse<T> | ApiError
