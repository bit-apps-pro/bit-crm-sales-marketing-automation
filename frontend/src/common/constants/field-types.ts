import { __ } from '@common/helpers/i18nWrap'

const FIELD_TYPES = [
  {
    label: __('Text'),
    value: 'text'
  },
  {
    label: __('Text Multi-Line'),
    value: 'textarea'
  },
  {
    label: __('Number'),
    value: 'number'
  },
  {
    label: __('Select'),
    value: 'select'
  },
  {
    label: __('Multi Select'),
    value: 'multi-select'
  },
  {
    label: __('Radio'),
    value: 'radio'
  },
  {
    label: __('Checkbox'),
    value: 'checkbox'
  },
  {
    label: __('Date'),
    value: 'date'
  },
  {
    label: __('Section (Divider)'),
    value: 'section'
  }
]

export default FIELD_TYPES
