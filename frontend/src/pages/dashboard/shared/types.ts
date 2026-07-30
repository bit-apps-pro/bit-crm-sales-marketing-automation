import { type ActivityType, type ActivityTypeValue } from '@features/activity-feed/shared/activity-types'

export interface DealPipeline {
  amount: string
  color: null | string
  count: string
  name: string
  stage: string
}

export interface InvoiceData {
  grand_total: string
  status: string
  total: string
}
export interface LeadCountBySource {
  lead_source: string
  total: string
}

export type PendingActivityItem = Pick<
  ActivityType,
  'assigned_to' | 'assignee' | 'details' | 'due_date' | 'id' | 'title'
>

export interface PendingActivityGroup {
  items: PendingActivityItem[]
  total: number
}

export type PendingActivity = Record<ActivityTypeValue, PendingActivityGroup>

export type Trend = 'down' | 'flat' | 'up'

export interface DashboardStat {
  percentageChange: number
  total: number
  trend: Trend
}

export interface DashboardStats {
  companies: DashboardStat
  contacts: DashboardStat
  deals: DashboardStat
  invoices: DashboardStat
  leads: DashboardStat
}
