import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import If from '@utilities/If'
import { InputNumber, Select, Space } from 'antd'
import { type BaseOptionType } from 'antd/es/select'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TAX } from '../shared/constants'
import { calculateGrandTotal, calculateSubtotal, calculateTotalTax } from '../shared/helpers'
import { type ProductSummaryProps } from '../shared/types'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useLineItemsStoreActions,
  useTaxOptionSelect
} from '../state/use-line-items-store'

const optionRender = (option: BaseOptionType): string => {
  switch (option.value) {
    case 'amount': {
      return `${option.label} - Amount`
    }
    case 'rate': {
      return `${option.label} - Percentage`
    }
    default: {
      return option.label
    }
  }
}

export default function ProductSummary({
  currencyData,
  grossDiscount: grossDiscountProp,
  grossDiscountOptions = {
    editable: true,
    enabled: true
  },
  grossDiscountType: grossDiscountTypeProp,
  localLineItems,
  taxOption: taxOptionProp
}: ProductSummaryProps) {
  const { homeCurrencyData } = useAtomValue($appConfig)

  const storeGrossDiscount = useGrossDiscountSelect()
  const storeGrossDiscountType = useGrossDiscountTypeSelect()
  const storeTaxOption = useTaxOptionSelect()

  const grossDiscount = grossDiscountProp ?? storeGrossDiscount
  const grossDiscountType = grossDiscountTypeProp ?? storeGrossDiscountType
  const taxOption = taxOptionProp ?? storeTaxOption

  const { setGrossDiscount, setGrossDiscountType } = useLineItemsStoreActions()

  const { grandTotal, grandTotalBeforeDiscount, subtotal, totalTax } = useMemo(() => {
    const grandTotalBeforeDiscount = calculateGrandTotal(localLineItems, taxOption)

    const discountAmount =
      grossDiscountType === 'amount' ? grossDiscount : (grandTotalBeforeDiscount * grossDiscount) / 100

    return {
      grandTotal: Math.max(0, grandTotalBeforeDiscount - discountAmount),
      grandTotalBeforeDiscount,
      subtotal: calculateSubtotal(localLineItems, taxOption),
      totalTax: calculateTotalTax(localLineItems, taxOption)
    }
  }, [localLineItems, taxOption, grossDiscount, grossDiscountType])

  const discountTypeOptions = useMemo(
    () => [
      { label: currencyData?.symbol || homeCurrencyData?.symbol, value: 'amount' },
      { label: __('%'), value: 'rate' }
    ],
    [currencyData, homeCurrencyData]
  )

  return (
    <div className="flex justify-end">
      <div className="w-[300px] space-y-2 border-t pt-4">
        <div className="flex items-center justify-between text-sm">
          <span>{__('Subtotal:')}</span>
          <span className="font-medium">{generateCurrencyFormatPreview(currencyData, subtotal)}</span>
        </div>
        <If conditions={taxOption !== TAX.NO_TAX}>
          <div className="flex items-center justify-between text-sm">
            <span>
              {__('Tax')} ({taxOption === TAX.INCLUSIVE ? __('Included') : __('Added')}):
            </span>
            <span className="font-medium">{generateCurrencyFormatPreview(currencyData, totalTax)}</span>
          </div>
        </If>
        <If conditions={grossDiscountOptions.enabled}>
          <div className="flex items-center justify-between text-sm">
            <span>{__('Gross Discount:')}</span>
            {grossDiscountOptions.editable ? (
              <Space.Compact>
                <Select
                  className="min-w-14"
                  onChange={setGrossDiscountType}
                  optionRender={optionRender}
                  options={discountTypeOptions}
                  popupMatchSelectWidth={false}
                  popupRender={menu => <div className="w-[150px]">{menu}</div>}
                  value={grossDiscountType}
                />
                <InputNumber
                  max={grossDiscountType === 'rate' ? 100 : grandTotalBeforeDiscount}
                  min={0}
                  onChange={value => setGrossDiscount(value || 0)}
                  value={grossDiscount}
                />
              </Space.Compact>
            ) : (
              <span className="font-medium">
                {grossDiscountType === 'amount'
                  ? generateCurrencyFormatPreview(currencyData, grossDiscount)
                  : `${grossDiscount}%`}
              </span>
            )}
          </div>
        </If>
        <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
          <span>{__('Grand Total:')}</span>
          <span>{generateCurrencyFormatPreview(currencyData, grandTotal)}</span>
        </div>
      </div>
    </div>
  )
}
