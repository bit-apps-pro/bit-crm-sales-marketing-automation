import { __ } from '@common/helpers/i18nWrap'
import { useAssignProductModalStoreActions } from '@features/assign-product-modal/state/use-assign-product-modal-store'
import {
  useLineItemsAmountSelect,
  useLineItemsSelect,
  useLineItemsStoreActions
} from '@features/product-line-items/state/use-line-items-store'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { MAX_ALLOWED_AMOUNT } from '@pages/deal/shared/constants'
import { Button, Form, type FormInstance, InputNumber, Space } from 'antd'
import { useMemo } from 'react'

export default function AmountFieldWithToggle({
  currencyData,
  form
}: {
  currencyData: CurrencyItemType
  form?: FormInstance
}) {
  const lineItems = useLineItemsSelect()
  const { setAmount } = useLineItemsStoreActions()
  const { setIsModalOpen } = useAssignProductModalStoreActions()
  const amount = useLineItemsAmountSelect()

  const hasLineItems = lineItems && lineItems.length > 0
  const amountValue = Form.useWatch('amount', form)
  const totalProducts = useMemo(
    () => lineItems.reduce((accumulator, item) => accumulator + item.quantity, 0),
    [lineItems]
  )

  return (
    <div>
      <Space.Compact block>
        <InputNumber
          className="w-full"
          disabled={hasLineItems}
          max={MAX_ALLOWED_AMOUNT}
          onChange={value => setAmount(value || 0, form)}
          placeholder={__('Enter Custom Amount / Select Product from List')}
          prefix={currencyData?.symbol}
          value={amountValue ?? amount}
        />
        <Button className="text-sm" onClick={() => setIsModalOpen(true)} size="large" type="primary">
          {__('Add Products')}
        </Button>
      </Space.Compact>
      {hasLineItems && (
        <div className="pt-[2px] text-sm font-light text-slate-400">
          <span>{__('Products Added:')}</span>{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {totalProducts} {totalProducts > 1 ? __('items') : __('item')}
          </span>
        </div>
      )}
    </div>
  )
}
