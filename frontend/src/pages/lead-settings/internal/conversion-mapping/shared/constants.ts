export const FIELD_TYPE_COMPATIBILITY: Record<string, string[]> = {
  checkbox: ['checkbox', 'multiselect'],
  currency: ['currency', 'number', 'text', 'textarea'],
  date: ['date'],
  email: ['email', 'text', 'textarea'],
  lookup_autocomplete: ['lookup_autocomplete', 'lookup_select'],
  lookup_select: ['lookup_select', 'lookup_autocomplete'],
  multiselect: ['multiselect', 'checkbox'],
  number: ['number', 'text', 'textarea'],
  radio: ['radio', 'select'],
  select: ['select', 'radio'],
  text: ['text', 'textarea'],
  textarea: ['textarea', 'text'],
  url: ['url', 'text', 'textarea']
}
