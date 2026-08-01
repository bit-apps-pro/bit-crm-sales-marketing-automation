import { INVOICE_STATUS } from '@common/constants/invoice-status'
import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { formatInvoiceAmount } from '@pages/Invoice/shared/invoice-payment-status'
import { Card } from 'antd'
import { useAtomValue } from 'jotai'

import PublicPayCardHeader from './internal/public-pay-card-header'
import { getDownloadUrl, getUnavailablePaymentReason } from './internal/public-pay-card-helpers'
import { type PublicPayCardProps } from './internal/public-pay-card-types'
import PublicPaySummary from './internal/public-pay-summary'

export default function PublicPayCard({
  currencyData: currencyDataProp,
  isPayable,
  isWooActive,
  status,
  summary,
  wooPayment
}: PublicPayCardProps) {
  const { homeCurrencyData } = useAtomValue($appConfig)
  const currencyData = currencyDataProp ?? homeCurrencyData
  const due = summary?.due ?? 0
  const isWooPaymentAvailable = wooPayment?.available ?? isWooActive
  const downloadUrl = getDownloadUrl()
  const unavailableReason = getUnavailablePaymentReason({
    due,
    isPayable,
    isWooActive,
    isWooPaymentAvailable,
    status,
    summary
  })

  const formatAmount = (value?: number | string) => formatInvoiceAmount(currencyData, value)

  return (
    <Card className="overflow-hidden shadow-sm [&_.ant-card-body]:p-0">
      <div className="flex items-center justify-between gap-3 p-7">
        <PublicPayCardHeader downloadUrl={downloadUrl} status={status} />
      </div>

      <PublicPaySummary formatAmount={formatAmount} summary={summary} />

      <div className="space-y-7 p-7">
        {unavailableReason ? (
          <p className="m-0 text-xs text-slate-400">{unavailableReason}</p>
        ) : isPayable && due <= 0 && status !== INVOICE_STATUS.PAID ? (
          <p className="m-0 text-xs text-slate-400">
            {__('There is no payable amount on this invoice yet.')}
          </p>
        ) : undefined}
      </div>
    </Card>
  )
}
