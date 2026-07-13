import { __ } from '@common/helpers/i18nWrap'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'

interface DealProductListSummaryProps {
  currencyData: CurrencyItemType
  grandTotal: number
  subtotal: number
  totalQuantity: number
}

export default function DealProductListSummary({
  currencyData,
  grandTotal,
  subtotal,
  totalQuantity
}: DealProductListSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-md border border-solid border-[#EBEAFF] bg-white p-2 text-center dark:border-neutral-700 dark:bg-neutral-800">
        <div className="text-base font-bold text-slate-800 dark:text-slate-100">{totalQuantity}</div>
        <div className="text-xs text-slate-500">{__('Total Quantity')}</div>
      </div>
      <div className="rounded-md border border-solid border-[#EBEAFF] bg-white p-2 text-center dark:border-neutral-700 dark:bg-neutral-800">
        <div className="break-all text-base font-bold text-slate-800 dark:text-slate-100">
          {generateCurrencyFormatPreview(currencyData, subtotal)}
        </div>
        <div className="text-xs text-slate-500">{__('Subtotal')}</div>
      </div>
      <div className="rounded-md border border-solid border-[#EBEAFF] bg-white p-2 text-center dark:border-neutral-700 dark:bg-neutral-800">
        <div className="break-all text-base font-bold text-slate-800 dark:text-slate-100">
          {generateCurrencyFormatPreview(currencyData, grandTotal)}
        </div>
        <div className="text-xs text-slate-500">{__('Grand Total')}</div>
      </div>
    </div>
  )
}
