import { __ } from '@common/helpers/i18nWrap'

export const PRIORITIES = {
  HIGH: 'high',
  LOW: 'low',
  MEDIUM: 'medium'
} as const

export const PRIORITY_OPTIONS = [
  { label: __('Low'), value: PRIORITIES.LOW },
  { label: __('Medium'), value: PRIORITIES.MEDIUM },
  { label: __('High'), value: PRIORITIES.HIGH }
]

export const STATUS_OPTIONS = [
  { label: __('All'), value: 'all' },
  { label: __('Pending'), value: 'pending' },
  { label: __('Completed'), value: 'completed' }
]
