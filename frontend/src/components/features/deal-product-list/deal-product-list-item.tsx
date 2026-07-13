import { __ } from '@common/helpers/i18nWrap'
import { calculateLineItemTotal } from '@features/product-line-items/shared/helpers'
import { type LineItem, type TaxOption } from '@features/product-line-items/shared/types'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import If from '@utilities/If'

interface DealProductListItemProps {
  currencyData: CurrencyItemType
  item: LineItem
  taxOption: TaxOption
}

export default function DealProductListItem({
  currencyData,
  item,
  taxOption
}: DealProductListItemProps) {
  const lineTotal = calculateLineItemTotal(item, taxOption)

  return (
    <div className="rounded-md border border-solid border-[#EBEAFF] bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
        <span className="font-semibold text-slate-800 dark:text-slate-100">{item.product_name}</span>
        <span className="break-all text-sm font-semibold text-slate-800 dark:text-slate-100">
          {generateCurrencyFormatPreview(currencyData, item.unit_price_in_deal_currency ?? 0)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-slate-500">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span>
            {__('Quantity:')}{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{item.quantity}</span>
          </span>
          <span>
            {__('Discount:')}{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {item.discount_percentage ?? 0}%
            </span>
          </span>
          <If conditions={taxOption !== 'no_tax'}>
            <span>
              {__('Tax:')}{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">{item.tax_rate}%</span>
            </span>
          </If>
        </div>
        <span className="break-all">
          {__('Total Price:')}{' '}
          <span className="text-base font-medium text-slate-700 dark:text-slate-300">
            {generateCurrencyFormatPreview(currencyData, lineTotal)}
          </span>
        </span>
      </div>
    </div>
  )
}
