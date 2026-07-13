import { type FieldItem } from '@features/field-settings/shared/field-types'

export const prepareFieldsAsOptions = (fields: FieldItem[]) => {
  const options: { label: string; value: string }[] = []

  fields.forEach(field => {
    if (field.type === 'section') {
      return
    }

    if (field.group_fields) {
      const nestedOptions = prepareFieldsAsOptions(Object.values(field.group_fields))
      options.push(...nestedOptions)
    } else {
      options.push({
        label: field.label,
        value: field.field_key
      })
    }
  })

  return options
}

const EXCLUDED_FIELD_KEYS = new Set(['name', 'probability'])
const EXCLUDED_FIELD_TYPES = new Set(['lookup_autocomplete', 'lookup_select', 'section'])

export const filterDealFields = (fields: FieldItem[]) =>
  fields.filter(
    field => !EXCLUDED_FIELD_KEYS.has(field.field_key) && !EXCLUDED_FIELD_TYPES.has(field.type)
  )

export const getFilteredOptions = (
  options: { label: string; value: string }[],
  selectedKeys: string[],
  currentFieldKey: string | undefined
) =>
  options.map(field => ({
    ...field,
    disabled: selectedKeys.includes(field.value) && field.value !== currentFieldKey
  }))
