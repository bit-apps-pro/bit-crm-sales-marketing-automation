import { __ } from '@common/helpers/i18nWrap'
import { type FieldItem } from '@features/field-settings/shared/field-types'

import { FIELD_TYPE_COMPATIBILITY } from './constants'

function filterCompatibleFields(sourceFieldType: string, targetFields: FieldItem[]): FieldItem[] {
  const compatibleTypes = FIELD_TYPE_COMPATIBILITY[sourceFieldType]

  if (!compatibleTypes) {
    return targetFields.filter(field => field.type === sourceFieldType)
  }

  if (compatibleTypes.length === 0) {
    return []
  }

  return targetFields.filter(field => compatibleTypes.includes(field.type))
}

export function generateCompatibleFieldOptions(
  sourceFieldType: string,
  systemDefinedFields: FieldItem[],
  customFields: FieldItem[]
) {
  const compatibleSystemFields = filterCompatibleFields(sourceFieldType, systemDefinedFields)
  const compatibleCustomFields = filterCompatibleFields(sourceFieldType, customFields)

  const options: {
    label: string
    options: { label: string; value: string }[]
  }[] = []

  if (compatibleSystemFields.length > 0) {
    options.push({
      label: __('System Defined Fields'),
      options: compatibleSystemFields.map(field => ({
        label: field.label,
        value: field.field_key
      }))
    })
  }

  if (compatibleCustomFields.length > 0) {
    options.push({
      label: __('Custom Fields'),
      options: compatibleCustomFields.map(field => ({
        label: field.label,
        value: field.field_key
      }))
    })
  }

  return options
}
