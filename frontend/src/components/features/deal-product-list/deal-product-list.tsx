import { __ } from '@common/helpers/i18nWrap'
import { ICONS } from '@common/icons'
import { useAssignProductModalStoreActions } from '@features/assign-product-modal/state/use-assign-product-modal-store'
import { calculateGrandTotal, calculateSubtotal } from '@features/product-line-items/shared/helpers'
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
    const grandTotalBeforeDiscount = calculateGrandTotal(lineItems, taxOption)
    const discountAmount =
      grossDiscountType === 'amount' ? grossDiscount : (grandTotalBeforeDiscount * grossDiscount) / 100

    return {
      grandTotal: Math.max(0, grandTotalBeforeDiscount - discountAmount),
      subtotal: calculateSubtotal(lineItems, taxOption),
      totalQuantity: lineItems.reduce((sum, item) => sum + item.quantity, 0)
    }
  }, [lineItems, taxOption, grossDiscount, grossDiscountType])

  const hasLineItems = lineItems.length > 0

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
