import { type BaseFieldType } from '@features/form-builder/shared/field-types'
import { capitalize } from 'lodash'

import { slugify } from './globalHelpers'

export const renderFullName = (title?: string, firstName?: string, lastName?: string): string => {
  return `${title ? capitalize(title) + ' ' : ''}${firstName ? firstName + ' ' : ''} ${lastName || ''}`
}

export const findMatchedFieldKey = (header: string, fields: BaseFieldType[]): string | undefined => {
  const matchedField = fields.find(field => {
    if (field.is_custom) return field.field_key === header

    return field.field_key === slugify(header, '_')
  })
  return matchedField?.field_key || undefined
}

export const renderFullAddress = (...addressParts: (string | undefined)[]): string =>
  addressParts.filter(Boolean).join(', ').trim()
