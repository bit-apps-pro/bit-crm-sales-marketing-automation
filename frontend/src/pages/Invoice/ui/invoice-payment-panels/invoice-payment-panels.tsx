import { __ } from '@common/helpers/i18nWrap'
import { type CollapseProps } from 'antd'

import InvoicePaymentsPanel from '../invoice-payments-panel'
import { type InvoicePaymentPanelsArgs } from './invoice-payment-panels-types'

/**
 * Free variant — the payment ledger is free, so the sidebar shows the real
 * payment history (manual settlements recorded with "Mark as Paid"). What
 * stays pro is collecting money: the payment settings panel (partial and
 * recurring payments) and the related-invoices panel of a recurring series.
 */
export default function getInvoicePaymentPanels({
  currencyData,
  invoiceId
}: InvoicePaymentPanelsArgs): NonNullable<CollapseProps['items']> {
  return [
    {
      children: <InvoicePaymentsPanel currencyData={currencyData} invoiceId={invoiceId} />,
      key: 'payments',
      label: <span className="text-slate-500">{__('Payment History')}</span>
    }
  ]
}
