import { __ } from '@common/helpers/i18nWrap'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { type QueryObserverResult } from '@tanstack/react-query'
import { Table, Typography } from 'antd'
import { type ColumnsType } from 'antd/es/table'
import { useMemo } from 'react'

interface CurrenciesTableProps {
  currencies: CurrencyItemType[]
  refetchCurrencies?: () => Promise<QueryObserverResult<unknown, unknown>>
}

export default function CurrenciesTable({ currencies }: CurrenciesTableProps) {
  const columns: ColumnsType<CurrencyItemType> = useMemo(
    () => [
      {
        dataIndex: 'label',
        key: 'label',
        title: __('Currency')
      },
      {
        dataIndex: 'symbol',
        key: 'symbol',
        render: (symbols: string) => <Typography.Text code>{symbols}</Typography.Text>,
        title: __('Symbol')
      },
      {
        key: 'format',
        render: (_, record) => {
          const formatPreview = generateCurrencyFormatPreview(record, 1_234_567.89)

          return <Typography.Text code>{formatPreview}</Typography.Text>
        },
        title: __('Format Preview')
      },
      {
        dataIndex: 'exchange_rate',
        key: 'exchange_rate',
        title: __('Exchange Rate')
      }
    ],
    []
  )

  return (
    <Table
      columns={columns}
      dataSource={currencies}
      pagination={false}
      rowKey="currency"
      scroll={{ x: 800 }}
      size="small"
    />
  )
}
