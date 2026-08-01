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
    <div className="grid grid-cols-3 border-0 border-y border-solid border-slate-100 bg-slate-50 px-7 py-7">
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
  return (
    <div className={bordered ? 'border-0 border-x border-solid border-slate-200 px-3' : 'px-3'}>
      <p className="m-0 text-center text-xs font-semibold uppercase text-slate-400">{label}</p>
      <strong
        className={accent ? 'block text-center text-[#7c3aed]' : 'block text-center text-slate-950'}
      >
        {value}
      </strong>
    </div>
  )
}
