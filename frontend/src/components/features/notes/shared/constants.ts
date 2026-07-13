import { __ } from '@common/helpers/i18nWrap'

export const DEFAULT_PAGE = 1
export const DEFAULT_PER_PAGE = 10

export const RECENT_FIRST = 'recent_first'
export const RECENT_LAST = 'recent_last'

export const SORT_OPTIONS = [
  {
    label: __('Recent First'),
    value: RECENT_FIRST
  },
  {
    label: __('Recent Last'),
    value: RECENT_LAST
  }
]
