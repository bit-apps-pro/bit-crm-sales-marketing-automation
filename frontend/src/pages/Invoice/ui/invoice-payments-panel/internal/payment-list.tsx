import { __ } from '@common/helpers/i18nWrap'
import { type InvoicePaymentItem } from '@pages/Invoice/shared/invoice-payment-types'
import { Empty } from 'antd'

import PaymentListItem from './payment-list-item'

interface Props {
  formatAmount: (amount?: number | string) => string
  payments: InvoicePaymentItem[]
}

export default function PaymentList({ formatAmount, payments }: Props) {
  if (payments.length === 0) {
    return <Empty description={__('No payments yet')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <ul className="list-none space-y-3">
      {payments.map(payment => (
        <PaymentListItem formatAmount={formatAmount} key={payment.id} payment={payment} />
      ))}
    </ul>
  )
}
