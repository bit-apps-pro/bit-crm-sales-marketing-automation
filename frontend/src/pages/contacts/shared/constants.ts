import { __ } from '@common/helpers/i18nWrap'

export const DUPLICATE_HANDLING_OPTIONS = [
  {
    label: __('Skip existing contacts'),
    value: 'skip'
  },
  {
    label: __('Update existing contacts'),
    value: 'update'
  },
  {
    label: __('Create new even if email exists'),
    value: 'create'
  }
]

export const LOOKUP_FIELDS_CONFIG = {
  company_id: {
    label: __('Company'),
    targetIdLabel: __('ID'),
    targetIdValue: 'company_id',
    targetNameLabel: __('Company Name'),
    targetNameValue: 'company_name_lookup'
  },
  parent_id: {
    label: __('Reports To'),
    targetIdLabel: __('ID'),
    targetIdValue: 'parent_id',
    targetNameLabel: __('Last Name'),
    targetNameValue: 'parent_name_lookup'
  }
} as const
