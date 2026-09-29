import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import {
  getPaymentRefund,
  neutralBadgeClass,
  paymentStatusBadgeClass,
  paymentStatusConfig
} from '@pages/Invoice/shared/invoice-payment-status'
import { type InvoicePaymentItem } from '@pages/Invoice/shared/invoice-payment-types'
import If from '@utilities/If'
import { Typography } from 'antd'

const { Paragraph, Text } = Typography

interface Props {
  formatAmount: (amount?: number | string) => string
  payment: InvoicePaymentItem
}

export default function PaymentListItem({ formatAmount, payment }: Props) {
  const config = paymentStatusConfig[payment.status]
  const refund = getPaymentRefund(payment)
  /*
   * A manual row's provider_ref is minted by the CRM and means nothing to
   * anyone, so the reference line shows what the admin typed instead — and
   * disappears when they typed nothing.
   */
  const referenceLabel = payment.is_manual ? __('Reference: ') : __('Payment reference: ')
  const referenceValue = payment.is_manual ? payment.reference : payment.provider_ref

  return (
    <li className="rounded-md border border-solid border-[#EBEAFF] bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <Text className="break-all" strong>
          {refund ? (
            <>
              <Text className="me-2 font-normal" delete type="secondary">
                {formatAmount(refund.original)}
              </Text>
              {formatAmount(refund.net)}
            </>
          ) : (
            formatAmount(payment.amount)
          )}
        </Text>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={neutralBadgeClass()}>{payment.provider_label}</span>
          <span className={paymentStatusBadgeClass(payment.status)}>
            {config?.label ?? payment.status}
          </span>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <If
          conditions={Boolean(payment.charged_currency && payment.charged_currency !== payment.currency)}
        >
          <Text type="secondary">
            {__('Charged: ')}
            <Text className="font-medium">
              {payment.charged_amount} {payment.charged_currency}
            </Text>
          </Text>
        </If>
        <If conditions={Boolean(referenceValue)}>
          <Text type="secondary">
            {referenceLabel}
            <Text className="font-medium" copyable={!payment.is_manual}>
              {referenceValue}
            </Text>
          </Text>
        </If>
        {payment.paid_at ? (
          <Text type="secondary">
            {__('Date:')} <Text className="font-medium">{formatDateTime(payment.paid_at)}</Text>
          </Text>
        ) : undefined}
      </div>

      <If conditions={Boolean(payment.note)}>
        <Paragraph className="!mb-0 mt-2 break-words text-sm" type="secondary">
          {__('Note:')} <Text>{payment.note}</Text>
        </Paragraph>
      </If>
    </li>
  )
}
