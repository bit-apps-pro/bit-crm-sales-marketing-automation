import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { formatInvoiceAmount } from '@pages/Invoice/shared/invoice-payment-status'
import { Alert, Button, Skeleton } from 'antd'
import { useAtomValue } from 'jotai'

import useInvoicePayments from '../../data/use-invoice-payments'
import PanelScrollArea from '../panel-scroll-area'
import PaymentList from './internal/payment-list'
import PaymentSummary from './internal/payment-summary'

export default function InvoicePaymentsPanel({
  currencyData: currencyDataProp,
  invoiceId
}: {
  currencyData?: CurrencyItemType
  invoiceId: number
}) {
  const { homeCurrencyData } = useAtomValue($appConfig)
  const currencyData = currencyDataProp ?? homeCurrencyData
  const { isPaymentsError, isPaymentsLoading, payments, refetchPayments, summary } =
    useInvoicePayments(invoiceId)

  const formatAmount = (amount?: number | string) => formatInvoiceAmount(currencyData, amount)

  if (isPaymentsLoading) {
    return <Skeleton active paragraph={{ rows: 3 }} />
  }

  if (isPaymentsError) {
    return (
      <Alert
        action={
          <Button onClick={() => refetchPayments()} size="small">
            {__('Retry')}
          </Button>
        }
        message={__('Failed to load payments')}
        showIcon
        type="error"
      />
    )
  }

  return (
    <PanelScrollArea className="space-y-3">
      {summary ? <PaymentSummary formatAmount={formatAmount} summary={summary} /> : undefined}

      <PaymentList formatAmount={formatAmount} payments={payments} />
    </PanelScrollArea>
  )
}
