import { INVOICE_STATUS } from '@common/constants/invoice-status'
import { __ } from '@common/helpers/i18nWrap'

export const statusConfig = {
  [INVOICE_STATUS.DRAFT]: { color: 'default', label: __('Draft') },
  [INVOICE_STATUS.OVERDUE]: { color: 'red', label: __('Overdue') },
  [INVOICE_STATUS.PAID]: { color: 'green', label: __('Paid') },
  [INVOICE_STATUS.PARTIALLY_PAID]: { color: 'orange', label: __('Partially Paid') },
  [INVOICE_STATUS.SENT]: { color: 'blue', label: __('Sent') }
}
