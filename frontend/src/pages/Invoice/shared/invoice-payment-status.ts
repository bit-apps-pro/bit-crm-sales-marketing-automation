import { __ } from '@common/helpers/i18nWrap'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'

import { type InvoicePaymentItem, type InvoicePaymentStatus } from './invoice-payment-types'

export const paymentStatusConfig: Record<InvoicePaymentStatus, { label: string }> = {
  cancelled: { label: __('Cancelled') },
  completed: { label: __('Completed') },
  failed: { label: __('Failed') },
  pending: { label: __('Pending') },
  refunded: { label: __('Refunded') }
}

/**
 * Original/net amounts of a partially refunded completed payment, or undefined
 * when there is nothing to cross out (no refund, or the row's own status
 * already tells the story — e.g. fully `refunded`).
 */
export function getPaymentRefund(payment: InvoicePaymentItem) {
  const refunded = Number(payment.refunded_amount ?? 0)

  if (payment.status !== 'completed' || !(refunded > 0)) return

  const original = Number(payment.amount)

  return { net: Math.max(0, original - refunded), original, refunded }
}

export function paymentStatusBadgeClass(status: InvoicePaymentStatus): string {
  const base = 'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold'

  if (status === 'completed') {
    return `${base} bg-[#ecfdf5] text-[#15803d] dark:bg-[#052e1c] dark:text-[#86efac]`
  }

  if (status === 'failed') {
    return `${base} bg-[#fef2f2] text-[#dc2626] dark:bg-[#450a0a] dark:text-[#fca5a5]`
  }

  if (status === 'refunded') {
    return `${base} bg-[#faf5ff] text-[#7e22ce] dark:bg-[#3b0764] dark:text-[#d8b4fe]`
  }

  if (status === 'cancelled') {
    return `${base} bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400`
  }

  return `${base} bg-[#fffbeb] text-[#b45309] dark:bg-[#451a03] dark:text-[#fcd34d]`
}

export function formatInvoiceAmount(
  currencyData: CurrencyItemType,
  amount?: number | string
): string {
  return amount === undefined ? '-' : generateCurrencyFormatPreview(currencyData, Number(amount))
}
