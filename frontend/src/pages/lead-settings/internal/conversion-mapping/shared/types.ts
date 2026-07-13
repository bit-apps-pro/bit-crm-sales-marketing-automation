import { type FieldItem } from '@features/field-settings/shared/field-types'

export interface DataSourceItem {
  companyField?: FieldItem
  contactField?: FieldItem
  dealField?: FieldItem
  key: string
  leadField: FieldItem
  leadFieldKey: string
  leadLabel: string
}

export interface SaveMappingPayload {
  setting_key: string
  setting_value: ConversionMappingResponse
}

interface EntityMapping {
  customFields: Record<string, { field_id: number; field_key: string }>
  systemDefinedFields: Record<string, string>
}

export interface ConversionMappingResponse {
  mappings: Record<'company' | 'contact' | 'deal', EntityMapping>
}
