import { INVOICE_STATUS, type InvoiceStatus } from '@common/constants/invoice-status'
import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import { type InvoicePaymentSummary } from '@pages/Invoice/shared/invoice-payment-types'

import { getPublicInvoiceContext } from '../../../shared/public-invoice-types'

export { paymentStatusConfig } from '@pages/Invoice/shared/invoice-payment-status'

export const statusLabelMap: Partial<Record<InvoiceStatus, string>> = {
  [INVOICE_STATUS.OVERDUE]: __('Overdue'),
  [INVOICE_STATUS.PAID]: __('Paid'),
  [INVOICE_STATUS.PARTIALLY_PAID]: __('Partially Paid'),
  [INVOICE_STATUS.SENT]: __('Awaiting Payment')
}

export function getDownloadUrl() {
  const context = getPublicInvoiceContext()
  if (!context) return

  const uri = new URL(`${config.API_URL}/invoices/public/${context.id}/download`)
  uri.searchParams.append('token', context.token)

  return uri.href
}

export function paymentOptionClass(isSelected: boolean) {
  return [
    '!m-0 flex min-h-[68px] w-full items-start rounded-md border border-solid p-3 transition-colors',
    isSelected ? 'border-[#d7defe] bg-[#fbfaff]' : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
  ].join(' ')
}

export function statusPillClass(status: InvoiceStatus) {
  const base =
    'inline-flex min-h-7 items-center rounded-full border border-solid px-4 text-sm font-semibold'

  if (status === INVOICE_STATUS.PAID) return `${base} border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]`
  if (status === INVOICE_STATUS.OVERDUE) return `${base} border-[#fecaca] bg-[#fef2f2] text-[#dc2626]`
  if (status === INVOICE_STATUS.PARTIALLY_PAID) {
    return `${base} border-[#fed7aa] bg-[#fff7ed] text-[#ea580c]`
  }

  return `${base} border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]`
}

export function getUnavailablePaymentReason({
  due,
  isPayable,
  isWooActive,
  isWooPaymentAvailable,
  status,
  summary
}: {
  due: number
  isPayable: boolean
  isWooActive: boolean
  isWooPaymentAvailable: boolean
  status: InvoiceStatus
  summary?: InvoicePaymentSummary
}) {
  if (status === INVOICE_STATUS.PAID || (summary && due <= 0)) return

  if (!summary) {
    return __('Payment details are not available for this invoice yet.')
  }

  if (!isWooActive) {
    return __('WooCommerce is not active, so online payment is unavailable.')
  }

  if (!isWooPaymentAvailable) {
    return __('Online payment is currently unavailable for this invoice.')
  }

  if (!isPayable) {
    return __('This invoice is not open for payment yet.')
  }
}
