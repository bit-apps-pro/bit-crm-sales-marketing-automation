import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type Order } from '@features/form-builder/shared/field-types'

export interface ImportLeadsPropsType {
  customFields: FieldItem[]
  systemDefinedFields: FieldItem[]
}

export interface ExportLeadsPropsType {
  customFields: FieldItem[]
  systemDefinedFields: FieldItem[]
  totalLeads: number
}

export interface LeadBulkOperationsPropsType {
  selectedIds: number[]
  setSelectedIds: (ids: Record<string, boolean>) => void
}

export interface LeadTableSettingsResponseType {
  data: {
    fields: FieldItem[]
    orders: Order[]
    visible_columns: string[]
  }
}

export type UpdateLeadTableSettingsPayloadType =
  | {
      setting_key: 'company_lead_table_columns_order'
      setting_value: Order[]
    }
  | {
      setting_key: 'company_lead_table_visible_columns'
      setting_value: string[]
    }
  | {
      setting_key: 'lead_table_columns_order'
      setting_value: Order[]
    }
  | {
      setting_key: 'lead_table_visible_columns'
      setting_value: string[]
    }

export interface ConvertLeadsPayload {
  convertTo: string[]
  dealFieldOverrides: Record<string, string>
  defaultOwnerId?: number | string
  ids: number[]
  moveRelatedData: string[]
  moveRelatedDataTo: string
  moveTagsTo: string
}
