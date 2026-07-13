import { type BaseFieldItemType } from '@features/entity-form/shared/entity-form-types'

import {
  MULTI_SELECT_FIELD_TYPES,
  NON_FILTERABLE_FIELD_KEYS,
  NON_FILTERABLE_FIELD_TYPES,
  SELECT_FIELD_TYPES,
  TEXT_FIELD_TYPES
} from './constants'
import { type FilterField, type FilterItemErrors } from './types'

export const getFieldFilterType = (fieldType: string): string => {
  if (MULTI_SELECT_FIELD_TYPES.has(fieldType)) {
    return 'multi-select'
  }

  if (SELECT_FIELD_TYPES.has(fieldType)) {
    return 'select'
  }

  if (TEXT_FIELD_TYPES.has(fieldType)) {
    return 'text'
  }

  return fieldType
}

export const getFilterableFields = <T extends BaseFieldItemType>(fields: T[]): FilterField[] => {
  return fields
    .filter(
      field =>
        !NON_FILTERABLE_FIELD_TYPES.has(field.type) && !NON_FILTERABLE_FIELD_KEYS.has(field.field_key)
    )
    .map(field => ({
      formatted_type: getFieldFilterType(field.type),
      is_custom: field.is_custom || false,
      label: field.label,
      options: field.options || [],
      related_module: field.related_module || '',
      type: field.type,
      value: field.field_key
    }))
}

export const getFilterItemErrors = (
  advancedFilterErrors: Record<string, string[]>,
  groupIndex: number,
  filterIndex: number
): FilterItemErrors => {
  const prefix = `advancedFilterGroups.${groupIndex}.${filterIndex}`

  const result: FilterItemErrors = {}
  Object.entries(advancedFilterErrors).forEach(([key, messages]) => {
    if (key.startsWith(prefix)) {
      // Extract the field name after the prefix e.g., "advancedFilterGroups.0.1.operator" → "operator"
      const field = key.replace(`${prefix}.`, '')

      if (field === 'operator' || field === 'field_key' || field === 'value') {
        result[field] = messages[0]
      }
    }
  })

  return result
}
