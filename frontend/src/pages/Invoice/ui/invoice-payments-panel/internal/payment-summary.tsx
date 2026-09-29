import { __ } from '@common/helpers/i18nWrap'
import { type InvoicePaymentSummary } from '@pages/Invoice/shared/invoice-payment-types'

interface Props {
  formatAmount: (amount?: number | string) => string
  summary: InvoicePaymentSummary
}

export default function PaymentSummary({ formatAmount, summary }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <SummaryItem label={__('Total')} value={formatAmount(summary.total)} />
      <SummaryItem label={__('Paid')} value={formatAmount(summary.paid)} />
      <SummaryItem label={__('Due')} value={formatAmount(summary.due)} />
    </div>
  )
}

/** One value-over-label tile; `large` is the single-figure form the Mark as Paid modal uses. */
export function SummaryItem({
  label,
  size = 'default',
  value
}: {
  label: string
  size?: 'default' | 'large'
  value: string
}) {
  const isLarge = size === 'large'

  return (
    <div
      className={`rounded-md border border-solid border-[#EBEAFF] bg-white text-center dark:border-neutral-700 dark:bg-neutral-800 ${isLarge ? 'p-3' : 'p-2'}`}
    >
      <div
        className={`break-all font-semibold text-slate-800 dark:text-slate-100 ${isLarge ? 'text-lg' : ''}`}
      >
        {value}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
