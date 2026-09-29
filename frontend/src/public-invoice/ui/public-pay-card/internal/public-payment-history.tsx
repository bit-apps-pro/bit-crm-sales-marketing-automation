import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { getPaymentRefund, paymentStatusBadgeClass } from '@pages/Invoice/shared/invoice-payment-status'
import { type PublicPaymentItem } from '@pages/Invoice/shared/invoice-payment-types'

import { paymentStatusConfig } from './public-pay-card-helpers'
import { type FormatAmount } from './public-pay-card-types'

export default function PublicPaymentHistory({
  formatAmount,
  payments
}: {
  formatAmount: FormatAmount
  payments: PublicPaymentItem[]
}) {
  if (payments.length === 0) return

  return (
    <section className="border-0 border-t border-solid border-slate-100 pt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="m-0 text-sm font-semibold text-slate-700">{__('Payment history')}</h3>
      </div>

      <ul className="m-0 list-none divide-y divide-slate-100 p-0">
        {payments.map(payment => {
          const paymentConfig = paymentStatusConfig[payment.status]
          const refund = getPaymentRefund(payment)

          return (
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm" key={payment.id}>
              <span className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-slate-700">
                  {refund ? (
                    <>
                      <s className="me-2 font-normal text-slate-400">{formatAmount(refund.original)}</s>
                      {formatAmount(refund.net)}
                    </>
                  ) : (
                    formatAmount(payment.amount)
                  )}
                </strong>
                {payment.charged_currency && payment.charged_currency !== payment.currency ? (
                  <span className="block truncate text-xs text-slate-400">
                    {__('Charged')} {payment.charged_amount} {payment.charged_currency}
                  </span>
                ) : undefined}
                <span className="block truncate text-xs text-slate-400">
                  {payment.paid_at ? formatDateTime(payment.paid_at) : __('Date unavailable')}
                </span>
              </span>

              <span className={paymentStatusBadgeClass(payment.status)}>{paymentConfig.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
