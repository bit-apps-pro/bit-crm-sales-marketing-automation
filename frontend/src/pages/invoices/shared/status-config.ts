import { __ } from '@common/helpers/i18nWrap'

export const statusConfig = {
  draft: { color: 'default', label: __('Draft') },
  overdue: { color: 'red', label: __('Overdue') },
  paid: { color: 'green', label: __('Paid') }
}
