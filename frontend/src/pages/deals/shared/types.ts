import { type FilterCondition } from '@features/advanced-filter/shared/types'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type Deal } from '@pages/deal/shared/deal-types'

export interface StageStatistic {
  count: number
  totalAmount: number
}

export interface SearchData {
  advancedFilterGroups?: FilterCondition[][]
  page: number
  perPage: number
  searchTerm: string
  sortBy: string
  sortOrder: string
  table?: boolean
}

export interface DealsResponse {
  data: Deal[]
  stageStatistics: Record<string, StageStatistic>
  total: number
}

export interface ImportDealsProps {
  customFields: FieldItem[]
  systemDefinedFields: FieldItem[]
}
