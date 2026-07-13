import { __ } from '@common/helpers/i18nWrap'

export const DUPLICATE_HANDLING_OPTIONS = [
  {
    label: __('Skip existing deals'),
    value: 'skip'
  },
  {
    label: __('Update existing deals'),
    value: 'update'
  },
  {
    label: __('Create new even if name exists'),
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
  contact_id: {
    label: __('Contact'),
    targetIdLabel: __('ID'),
    targetIdValue: 'contact_id',
    targetNameLabel: __('Last Name'),
    targetNameValue: 'contact_name_lookup'
  }
} as const
