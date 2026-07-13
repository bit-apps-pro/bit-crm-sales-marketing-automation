import { type FieldItem } from '@features/field-settings/shared/field-types'

export interface ImportCompaniesProps {
  customFields: FieldItem[]
  systemDefinedFields: FieldItem[]
}

export interface ExportCompaniesPayloadType<T> {
  customFields: T
  pagination: {
    offset: number
    perPage: number
  }
  systemDefinedFields: T
}
