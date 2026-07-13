import { __ } from '@common/helpers/i18nWrap'

export const DUPLICATE_HANDLING_OPTIONS = [
  {
    label: __('Skip existing companies'),
    value: 'skip'
  },
  {
    label: __('Update existing companies'),
    value: 'update'
  },
  {
    label: __('Create new even if name exists'),
    value: 'create'
  }
]

export const LOOKUP_FIELDS_CONFIG = {
  parent_id: {
    label: __('Parent Company'),
    targetIdLabel: __('ID'),
    targetIdValue: 'parent_id',
    targetNameLabel: __('Company Name'),
    targetNameValue: 'parent_name_lookup'
  }
} as const
