/* eslint-disable no-param-reassign */
import { type FieldItem } from '@features/field-settings/shared/field-types'

export interface ProcessedFieldMapResult {
  customFieldsValues: Record<string, { field_id: number; field_key: string; field_type: string }>
  systemDefinedFieldsValues: Record<string, string>
}

const mapFieldsToCsvHeaders = (
  fields: FieldItem[],
  values: Record<string, string>,
  customFieldsValues: Record<string, { field_id: number; field_key: string; field_type: string }> = {},
  systemDefinedFieldsValues: Record<string, string> = {}
): ProcessedFieldMapResult => {
  fields.forEach(field => {
    if (!field) return

    const { field_key: fieldKey, group_fields: fieldsGroup, id, is_custom: isCustom, type } = field

    if (type === 'section') return

    if (fieldsGroup) {
      mapFieldsToCsvHeaders(
        Object.values(fieldsGroup),
        values,
        customFieldsValues,
        systemDefinedFieldsValues
      )
      return
    }

    const csvHeaderKey = Object.keys(values).find(k => values[k] === fieldKey)
    if (!csvHeaderKey) return

    if (isCustom) {
      customFieldsValues[csvHeaderKey] = {
        field_id: id,
        field_key: fieldKey,
        field_type: type
      }
      return
    }

    systemDefinedFieldsValues[csvHeaderKey] = values[csvHeaderKey]
  })

  return {
    customFieldsValues,
    systemDefinedFieldsValues
  }
}

export const formatFieldsMap = (
  fields: FieldItem[],
  values: Record<string, string>
): ProcessedFieldMapResult => {
  return mapFieldsToCsvHeaders(fields, values)
}
