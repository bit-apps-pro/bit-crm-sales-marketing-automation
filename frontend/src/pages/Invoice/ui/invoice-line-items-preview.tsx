import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { calculateLineItemTotal } from '@features/product-line-items/shared/helpers'
import {
  type DiscountType,
  type LineItem,
  type TaxOption
} from '@features/product-line-items/shared/types'
import ProductSummary from '@features/product-line-items/ui/product-summary'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { type CurrencyItemType } from '@pages/invoice-create/shared/invoice-create-types'
import { type TableColumnsType } from 'antd'
import { Table, Typography } from 'antd'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

interface InvoiceLineItemsPreviewProps {
  currencyData?: CurrencyItemType
  grossDiscountAmount: number
  grossDiscountType: DiscountType
  lineItems: LineItem[]
  taxOption: TaxOption
}

export default function InvoiceLineItemsPreview({
  currencyData: currencyDataProp,
  grossDiscountAmount,
  grossDiscountType,
  lineItems,
  taxOption
}: InvoiceLineItemsPreviewProps) {
  const { homeCurrencyData } = useAtomValue($appConfig)
  const currencyData = currencyDataProp ?? homeCurrencyData

  const columns: TableColumnsType<LineItem> = useMemo(
    () => [
      {
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => (
          <div>
            <Typography.Text strong>{record.product_name}</Typography.Text>
            {record.description && (
              <div>
                <Typography.Text className="text-gray-500">{record.description}</Typography.Text>
              </div>
            )}
          </div>
        ),
        title: __('Product Name'),
        width: '40%'
      },
      {
        align: 'right' as const,
        dataIndex: 'price',
        key: 'price',
        render: (_, record) => (
          <Typography.Text>
            {generateCurrencyFormatPreview(currencyData, record.unit_price_in_deal_currency, false)}
          </Typography.Text>
        ),
        title: __('Price') + ` (${currencyData.symbol})`
      },
      {
        align: 'right' as const,
        dataIndex: 'quantity',
        key: 'quantity',
        title: __('Qty')
      },
      {
        align: 'right' as const,
        dataIndex: 'discount_percentage',
        key: 'discount_percentage',
        title: __('Discount (%)')
      },
      ...(taxOption === 'no_tax'
        ? []
        : [
            {
              align: 'right' as const,
              dataIndex: 'tax_rate',
              key: 'tax_rate',
              title: __('Tax Rate (%)')
            }
          ]),
      {
        align: 'right' as const,
        dataIndex: 'total',
        key: 'total',
        render: (_, record) => (
          <Typography.Text>
            {generateCurrencyFormatPreview(
              currencyData,
              calculateLineItemTotal(record, taxOption),
              false
            )}
          </Typography.Text>
        ),
        title: __('Total') + ` (${currencyData.symbol})`
      }
    ],
    [taxOption, currencyData]
  )

  return (
    <div>
      <Table
        bordered
        className="[&_th]:whitespace-nowrap"
        columns={columns}
        dataSource={lineItems}
        pagination={false}
        rowKey="id"
        size="small"
      />
      <ProductSummary
        currencyData={currencyData}
        grossDiscount={grossDiscountAmount}
        grossDiscountOptions={{ editable: false, enabled: true }}
        grossDiscountType={grossDiscountType}
        localLineItems={lineItems}
        taxOption={taxOption}
      />
    </div>
  )
}
