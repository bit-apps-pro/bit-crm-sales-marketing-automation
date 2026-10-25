import { __ } from '@common/helpers/i18nWrap'
import { ICONS } from '@common/icons'
import { useAssignProductModalStoreActions } from '@features/assign-product-modal/state/use-assign-product-modal-store'
import { calculateTotals, getRoundingDecimals } from '@features/product-line-items/shared/helpers'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useLineItemsSelect,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { Button, Empty } from 'antd'
import { useMemo } from 'react'

import DealProductListItem from './deal-product-list-item'
import DealProductListSummary from './deal-product-list-summary'

interface DealProductListProps {
  currencyData: CurrencyItemType
}

export default function DealProductList({ currencyData }: DealProductListProps) {
  const lineItems = useLineItemsSelect()
  const taxOption = useTaxOptionSelect()
  const grossDiscount = useGrossDiscountSelect()
  const grossDiscountType = useGrossDiscountTypeSelect()
  const { setIsModalOpen } = useAssignProductModalStoreActions()

  const { grandTotal, subtotal, totalQuantity } = useMemo(() => {
    const totals = calculateTotals(
      lineItems,
      taxOption,
      grossDiscount,
      grossDiscountType,
      currencyData?.decimal_places
    )

    return {
      grandTotal: totals.grandTotal,
      subtotal: totals.subtotal,
      totalQuantity: lineItems.reduce((sum, item) => sum + item.quantity, 0)
    }
  }, [lineItems, taxOption, grossDiscount, grossDiscountType, currencyData?.decimal_places])

  const hasLineItems = lineItems.length > 0
  const roundingDecimals = getRoundingDecimals(lineItems, taxOption, currencyData?.decimal_places)

  return (
    <div
      className="scroller thin max-h-[350px] space-y-2 overflow-y-auto"
      style={{ marginInline: '-10px', paddingInline: '10px' }}
    >
      {hasLineItems ? (
        <>
          <DealProductListSummary
            currencyData={currencyData}
            grandTotal={grandTotal}
            subtotal={subtotal}
            totalQuantity={totalQuantity}
          />
          <div className="space-y-2">
            {lineItems.map(item => (
              <DealProductListItem
                currencyData={currencyData}
                item={item}
                key={item.id}
                roundingDecimals={roundingDecimals}
                taxOption={taxOption}
              />
            ))}
          </div>
        </>
      ) : (
        <Empty />
      )}

      <Button icon={ICONS['edit']} onClick={() => setIsModalOpen(true)}>
        {hasLineItems ? __('Customize') : __('Add Products')}
      </Button>
    </div>
  )
}
