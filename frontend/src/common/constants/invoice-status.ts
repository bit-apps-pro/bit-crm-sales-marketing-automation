import { __ } from '@common/helpers/i18nWrap'

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  OVERDUE: 'overdue',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
  SENT: 'sent'
} as const

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS]

export const INVOICE_STATUS_OPTIONS: { label: string; value: InvoiceStatus }[] = [
  { label: __('Draft'), value: INVOICE_STATUS.DRAFT },
  { label: __('Sent'), value: INVOICE_STATUS.SENT },
  { label: __('Paid'), value: INVOICE_STATUS.PAID },
  { label: __('Partially Paid'), value: INVOICE_STATUS.PARTIALLY_PAID },
  { label: __('Overdue'), value: INVOICE_STATUS.OVERDUE }
]
