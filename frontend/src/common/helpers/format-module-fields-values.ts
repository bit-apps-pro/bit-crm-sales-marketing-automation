/* eslint-disable no-param-reassign */
import { type BaseFieldItemType } from '@features/entity-form/shared/entity-form-types'
import dayjs from 'dayjs'

type FieldValues = Record<string, unknown>

export interface ProcessedFieldsResult {
  customFieldsValues: Record<string, Record<string, unknown>>
  id?: number | string
  systemDefinedFieldsValues: Record<string, unknown>
}

const processFields = (
  fields: BaseFieldItemType[],
  values: FieldValues,
  customFieldsValues: Record<string, Record<string, unknown>> = {},
  systemDefinedFieldsValues: Record<string, unknown> = {}
): {
  customFieldsValues: Record<string, Record<string, unknown>>
  systemDefinedFieldsValues: Record<string, unknown>
} => {
  fields.forEach(field => {
    if (!field) return

    const { field_key: fieldKey, group_fields: fieldsGroup, id, is_custom: isCustom, type } = field
    let value = values[fieldKey]
    const hasValue = value !== undefined && value !== null

    if (type === 'section') return

    if ((type === 'multi-select' || type === 'checkbox') && Array.isArray(value))
      value = JSON.stringify(value)

    if (type === 'date') {
      value = hasValue && value !== '' ? dayjs(value as string).format('YYYY-MM-DD') : value
    }

    if (type === 'currency') {
      value = hasValue ? String(value) : value
    }

    if (type === 'currency' || type === 'percentage') {
      value = value && String(value)
    }

    if (fieldKey === 'status') {
      value = value ? '1' : '0'
    }

    if (fieldsGroup) {
      processFields(Object.values(fieldsGroup), values, customFieldsValues, systemDefinedFieldsValues)
      return
    }

    if (isCustom) {
      customFieldsValues[fieldKey] = {
        field_id: id,
        field_value: value ?? ''
      }
      return
    }

    systemDefinedFieldsValues[fieldKey] = value ?? ''
  })

  return {
    customFieldsValues,
    systemDefinedFieldsValues
  }
}

export const formatModuleFieldsValues = (
  fields: BaseFieldItemType[] = [],
  values: FieldValues = {}
): ProcessedFieldsResult => {
  const { customFieldsValues, systemDefinedFieldsValues } = processFields(fields, values)

  return {
    customFieldsValues,
    systemDefinedFieldsValues
  }
}
