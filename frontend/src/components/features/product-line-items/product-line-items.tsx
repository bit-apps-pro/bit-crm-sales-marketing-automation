import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { type Product } from '@common/types/product'
import useWooProductIntegration from '@pages/integration-settings/data/use-woo-product-integration'
import If from '@utilities/If'
import { Badge, Button, Select, Space, Typography } from 'antd'
import { lazy, useCallback, useEffect } from 'react'
import { LuPlus, LuTrash2 } from 'react-icons/lu'

import { PRODUCT_SOURCE } from './shared/constants'
import {
  addLineItem,
  calculateLineItemTotal,
  clearLineItemProduct,
  removeLineItem,
  selectProduct,
  updateLineItem
} from './shared/helpers'
import { TAX_OPTIONS } from './shared/options'
import { type LineItem, type ProductLineItemsProps } from './shared/types'
import {
  useLineItemsSelect,
  useLineItemsStoreActions,
  useTaxOptionSelect
} from './state/use-line-items-store'
import ProductSummary from './ui/product-summary'

const ProductLineItemsTable = lazy(() => import('./ui/product-line-items-table'))

export default function ProductLineItems({
  allowCustomSource = false,
  className = '',
  currencyData,
  localLineItems,
  setLocalLineItems
}: ProductLineItemsProps) {
  const existingLineItems = useLineItemsSelect()
  const taxOption = useTaxOptionSelect()
  const { setTaxOption } = useLineItemsStoreActions()
  const { isWooEnabled } = useWooProductIntegration()

  const getDefaultProductSource = () => {
    if (isWooEnabled) return PRODUCT_SOURCE.WOO_COMMERCE
    return allowCustomSource ? PRODUCT_SOURCE.CUSTOM : ''
  }

  const defaultProductSource = getDefaultProductSource()

  const handleUpdate = useCallback(
    (id: string, field: keyof LineItem, value?: number | string) => {
      if (field === 'product_source') {
        setLocalLineItems(prev => clearLineItemProduct(prev, id, value as string))
      } else {
        setLocalLineItems(prev => updateLineItem(prev, id, field, value))
      }
    },
    [setLocalLineItems]
  )

  const handleRemove = useCallback(
    (id: string) => {
      setLocalLineItems(prev => removeLineItem(prev, id))
    },
    [setLocalLineItems]
  )

  const handleSelectProduct = useCallback(
    (id: string, productData: Product) => {
      setLocalLineItems(prev => selectProduct(prev, id, productData, currencyData))
    },
    [currencyData, setLocalLineItems]
  )

  const handleAddLineItem = useCallback(() => {
    setLocalLineItems(prev => addLineItem(prev, defaultProductSource))
  }, [setLocalLineItems, defaultProductSource])

  const handleClearAll = useCallback(() => {
    setLocalLineItems(addLineItem([], defaultProductSource))
  }, [setLocalLineItems, defaultProductSource])

  const calculateLineTotal = useCallback(
    (item: LineItem) => calculateLineItemTotal(item, taxOption),
    [taxOption]
  )

  useEffect(() => {
    if (existingLineItems && existingLineItems.length > 0) {
      setLocalLineItems(existingLineItems)
    } else {
      setLocalLineItems(addLineItem([], defaultProductSource))
    }
  }, [existingLineItems, setLocalLineItems, defaultProductSource])

  return (
    <div className={cn('space-y-4 pt-4', className)}>
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm font-medium">{__('Tax Calculation:')}</span>
        <Select
          className="w-[180px]"
          onChange={value => setTaxOption(value)}
          options={TAX_OPTIONS}
          value={taxOption}
        />
      </div>

      <If conditions={localLineItems.length > 0}>
        <ProductLineItemsTable
          allowCustomSource={allowCustomSource}
          calculateLineTotal={calculateLineTotal}
          currencyData={currencyData}
          lineItems={localLineItems}
          onRemove={handleRemove}
          onSelectProduct={handleSelectProduct}
          onUpdate={handleUpdate}
        />
        <div className="flex items-center justify-between">
          <Space>
            <Button icon={<LuPlus />} onClick={handleAddLineItem} type="dashed">
              {__('Add Line Item')}
            </Button>
            <Button danger icon={<LuTrash2 />} onClick={handleClearAll} type="dashed">
              {__('Clear All')}
            </Button>
          </Space>
          <div className="flex gap-2 text-right">
            <Typography.Text type="secondary">
              {__('Products:')} {localLineItems.length}
            </Typography.Text>
            <Badge color="gray" />
            <Typography.Text type="secondary">
              {__('Total product quantity:')}{' '}
              {localLineItems.reduce((accumulator, item) => accumulator + item.quantity, 0)}
            </Typography.Text>
          </div>
        </div>
        <ProductSummary currencyData={currencyData} localLineItems={localLineItems} />
      </If>

      <If conditions={!localLineItems.length}>
        <div className="flex flex-col items-center gap-4 py-12 text-center text-gray-400">
          {__('Click "Add Line Item" to start adding products')}
          <Button icon={<LuPlus />} onClick={handleAddLineItem} type="dashed">
            {__('Add Line Item')}
          </Button>
        </div>
      </If>
    </div>
  )
}
