export type HireStatus = 'pending' | 'confirmed' | 'no_show' | 'cancelled'
export type ReminderType = 'welcome' | 'j7' | 'j3' | 'j1' | 'manual'
export type RecruiterRole = 'admin' | 'recruiter'

export interface Company {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Recruiter {
  id: string
  company_id: string
  full_name: string
  role: RecruiterRole
  created_at: string
}

export interface Hire {
  id: string
  company_id: string
  recruiter_id: string | null
  candidate_name: string
  candidate_email: string
  candidate_phone: string | null
  position: string
  start_date: string
  status: HireStatus
  token: string
  welcome_message: string | null
  confirmed_at: string | null
  created_at: string
}

export interface ChecklistItem {
  id: string
  company_id: string
  label: string
  required: boolean
  sort_order: number
}

export interface ChecklistCompletion {
  id: string
  hire_id: string
  item_id: string
  completed_at: string
}

export interface ReminderLog {
  id: string
  hire_id: string
  reminder_type: ReminderType
  sent_at: string
  email_id: string | null
}

export interface HireWithCompany extends Hire {
  companies: Company
}
