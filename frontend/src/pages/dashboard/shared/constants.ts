import { type DashboardStats, type PendingActivity } from './types'

export const DEFAULT_STATS: DashboardStats = {
  companies: { percentageChange: 0, total: 0, trend: 'flat' },
  contacts: { percentageChange: 0, total: 0, trend: 'flat' },
  deals: { percentageChange: 0, total: 0, trend: 'flat' },
  invoices: { percentageChange: 0, total: 0, trend: 'flat' },
  leads: { percentageChange: 0, total: 0, trend: 'flat' }
}

export const DEFAULT_PENDING_ACTIVITIES: PendingActivity = {
  call: { items: [], total: 0 },
  meeting: { items: [], total: 0 },
  task: { items: [], total: 0 }
}

export const DEAL_PIPELINE_CHART = {
  BAR_GAP: 40,
  BAR_THICKNESS: 104,
  CHART_HEIGHT: 340,
  CHART_PADDING_BOTTOM: 22,
  CHART_PADDING_TOP: 8,
  DATE_FORMAT: 'YYYY-MM-DD',
  MIN_BAR_WIDTH: 144,
  X_AXIS_HEIGHT: 28,
  Y_AXIS_WIDTH: 56,
  Y_TICKS: [0, 20, 40, 60, 80, 100]
} as const

export const THEME = {
  dark: { grid: 'rgba(255, 255, 255, 0.08)' },
  light: { grid: '#F1F0FA' }
}
