import { type InvoiceStatus } from '@common/constants/invoice-status'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import {
  type InvoicePaymentSummary,
  type PublicPaymentItem
} from '@pages/Invoice/shared/invoice-payment-types'

import { type PublicWooPayment } from '../../../shared/public-invoice-types'

export type FormatAmount = (value?: number | string) => string

export type PayMode = 'full' | 'partial'

export interface PublicPayCardProps {
  currencyData?: CurrencyItemType
  isPayable: boolean
  isWooActive: boolean
  partialPaymentAllowed: boolean
  payments: PublicPaymentItem[]
  status: InvoiceStatus
  summary?: InvoicePaymentSummary
  wooPayment?: PublicWooPayment
}
