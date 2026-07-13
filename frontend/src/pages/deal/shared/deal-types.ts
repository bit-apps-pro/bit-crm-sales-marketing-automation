import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type Order } from '@features/form-builder/shared/field-types'
import { type LineItem } from '@features/product-line-items/shared/types'
import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'

export interface DealTag {
  id?: number
  slug: string
  title: string
}

export interface DealRes {
  data: Deal
}

export interface Deal {
  [key: string]: unknown
  amount?: number
  closed_at: string
  company_id?: number
  company_name?: string
  contact_id?: number
  contact_name?: string
  created_at: string
  created_by_name?: string
  currency?: string
  description?: string
  email?: string
  gross_discount_amount?: number
  gross_discount_type?: 'amount' | 'rate'
  home_currency_amount?: number
  id: number
  lead_source?: string
  lineItems?: LineItem[]
  name: string
  next_id: null | number
  owner_id?: number
  owner_name?: string
  previous_id: null | number
  probability?: string
  stage?: string
  status?: boolean
  tags: DealTag[]
  tax_option?: 'exclusive' | 'inclusive' | 'no_tax'
  type?: string
  updated_at?: string
  updated_by_name?: string
}

export interface DealOverviewProps {
  columnSettings?: boolean | { column_size: number }
  deal: Deal
  fields: FieldItem[]
  tags: DealTag[]
}

export interface StageSelectBarProps {
  deal: Deal
}

export interface StageButtonProps {
  currentStageKey?: string
  disabled: boolean
  isFirst: boolean
  isLast: boolean
  onClick: (key: string) => void
  stage: Stage
}

export type UpdateDealTableSettingsPayload =
  | {
      setting_key: 'deal_table_columns_order'
      setting_value: Order[]
    }
  | {
      setting_key: 'deal_table_visible_columns'
      setting_value: string[]
    }

export interface UpdateDealTableSettingsResponse {
  data: {
    fields: FieldItem[]
    orders: Order[]
    visible_columns: string[]
  }
}
