import { type Order } from '@features/form-builder/shared/field-types'

export interface Option {
  label: string
  symbol?: string
  value: string
}

export interface FieldItem {
  field_key: string
  group_fields?: Record<string, FieldItem>
  help_text?: string
  id: number
  is_always_required?: boolean
  is_custom?: boolean
  is_visible?: boolean
  label: string
  max?: number
  min?: number
  module?: string
  name: string
  options?: Option[]
  required: boolean
  status: boolean
  tooltip?: string
  type: string
  width?: string
}

export interface FieldsResponseType {
  column_settings?: { column_size: number }
  fields: FieldItem[]
  orders: Order[]
}

export interface UpdateFieldsPayloadType {
  setting_key: string
  setting_value: Order[] | Record<string, unknown>
}

export interface UpdateFieldsResponseType {
  data: {
    fields: FieldItem[]
    orders: Order[]
  }
}

export interface UpsertColumnSettingsPayloadType {
  setting_key: string
  setting_value: {
    column_size: number
  }
}

export { type Order } from '@features/form-builder/shared/field-types'
