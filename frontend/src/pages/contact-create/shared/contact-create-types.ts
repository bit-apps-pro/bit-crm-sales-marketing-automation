import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'

export interface StoreContactPayloadType {
  clientPortal: boolean
  customFieldsValues: Record<string, Record<string, unknown>>
  newTagTitles: string[]
  nextAction?: null | string
  systemDefinedFieldsValues: Record<string, unknown>
  tagIds: number[]
}

export interface ContactFieldsResponseType {
  column_settings?: { column_size: number }
  fields: FieldItem[]
  orders: Order[]
}
