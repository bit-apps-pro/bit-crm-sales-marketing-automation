import { __ } from '@common/helpers/i18nWrap'
import { type Product } from '@common/types/product'
import ProductLookupSelect from '@components/features/product-lookup-select/product-lookup-select'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import useWooProductIntegration from '@pages/integration-settings/data/use-woo-product-integration'
import { Button, InputNumber, Table, type TableColumnsType } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { LuTrash2 } from 'react-icons/lu'

import { isLineItemEditable } from '../shared/helpers'
import { type LineItem, type ProductLineItemsTableProps } from '../shared/types'
import { useTaxOptionSelect } from '../state/use-line-items-store'

export default function ProductLineItemsTable({
  allowCustomSource = false,
  calculateLineTotal,
  currencyData,
  lineItems,
  onRemove,
  onSelectProduct,
  onUpdate
}: ProductLineItemsTableProps) {
  const { isWooEnabled } = useWooProductIntegration()
  const taxOption = useTaxOptionSelect()

  const columns: TableColumnsType<LineItem> = [
    {
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="space-y-2">
          <ProductLookupSelect
            allowCustomSource={allowCustomSource}
            className="w-full"
            enableWooProducts={isWooEnabled}
            name={record.product_name}
            onNameChange={value => onUpdate(record.id, 'product_name', value)}
            onSelect={option => {
              if (option.data) {
                onSelectProduct(record.id, option.data as Product)
              }
            }}
            onSourceChange={value => onUpdate(record.id, 'product_source', value)}
            productSource={record.product_source}
            value={record.product_id}
          />
          <TextArea
            disabled={!isLineItemEditable(record)}
            onChange={e => onUpdate(record.id, 'description', e.target.value)}
            placeholder={__('Description')}
            rows={1}
            size="large"
            value={record.description}
          />
        </div>
      ),
      title: __('Product Name'),
      width: 350
    },
    {
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => (
        <InputNumber
          className="w-full"
          disabled={!isLineItemEditable(record)}
          min={0}
          onChange={value => onUpdate(record.id, 'unit_price_in_deal_currency', value || 0)}
          prefix={currencyData?.symbol}
          value={record.unit_price_in_deal_currency}
        />
      ),
      title: __('Price'),
      width: 100
    },
    {
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => (
        <InputNumber
          className="w-full"
          disabled={!isLineItemEditable(record)}
          min={1}
          onChange={value => onUpdate(record.id, 'quantity', value || 1)}
          value={record.quantity}
        />
      ),
      title: __('Quantity'),
      width: 80
    },
    {
      dataIndex: 'discount_percentage',
      key: 'discount_percentage',
      render: (_, record) => (
        <InputNumber
          className="w-full"
          disabled={!isLineItemEditable(record)}
          max={100}
          min={0}
          onChange={value => onUpdate(record.id, 'discount_percentage', value || 0)}
          suffix="%"
          value={record.discount_percentage || 0}
        />
      ),
      title: __('Discount'),
      width: 80
    },
    {
      dataIndex: 'tax_rate',
      hidden: taxOption === 'no_tax',
      key: 'tax_rate',
      render: (_, record) => (
        <InputNumber
          className="w-full"
          disabled={!isLineItemEditable(record)}
          max={1000}
          min={0}
          onChange={value => onUpdate(record.id, 'tax_rate', value || 0)}
          suffix="%"
          value={record.tax_rate}
        />
      ),
      title: __('Tax Rate'),
      width: 80
    },
    {
      dataIndex: 'total',
      key: 'total',
      render: (_, record) => (
        <div className="font-medium">
          {generateCurrencyFormatPreview(currencyData, calculateLineTotal(record))}
        </div>
      ),
      title: __('Total'),
      width: 80
    },
    {
      align: 'center',
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          icon={<LuTrash2 />}
          onClick={() => onRemove(record.id)}
          size="small"
          type="text"
        />
      ),
      width: 50
    }
  ]

  return (
    <Table
      bordered
      columns={columns}
      dataSource={lineItems}
      pagination={false}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      size="small"
    />
  )
}
