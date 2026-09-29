import { __ } from '@common/helpers/i18nWrap'
import { type InvoicePaymentSummary } from '@pages/Invoice/shared/invoice-payment-types'

import { type FormatAmount } from './public-pay-card-types'

export default function PublicPaySummary({
  formatAmount,
  summary
}: {
  formatAmount: FormatAmount
  summary?: InvoicePaymentSummary
}) {
  return (
    <div className="grid grid-cols-1 gap-4 border-0 border-y border-solid border-slate-100 bg-slate-50 px-5 py-6 sm:grid-cols-3 sm:gap-0 sm:px-7 sm:py-7">
      <SummaryItem label={__('Total')} value={formatAmount(summary?.total)} />
      <SummaryItem bordered label={__('Paid')} value={formatAmount(summary?.paid)} />
      <SummaryItem accent label={__('Due')} value={formatAmount(summary?.due)} />
    </div>
  )
}

function SummaryItem({
  accent,
  bordered,
  label,
  value
}: {
  accent?: boolean
  bordered?: boolean
  label: string
  value: string
}) {
  /* Stacked below `sm`, so the separator that divides the three columns has to run along
     the block edges instead of the inline ones. */
  return (
    <div
      className={
        bordered
          ? 'border-0 border-y border-solid border-slate-200 px-3 py-3 sm:border-x sm:border-y-0 sm:py-0'
          : 'px-3'
      }
    >
      <p className="m-0 text-center text-xs font-semibold uppercase text-slate-400">{label}</p>
      <strong
        className={accent ? 'block text-center text-[#7c3aed]' : 'block text-center text-slate-950'}
      >
        {value}
      </strong>
    </div>
  )
}
