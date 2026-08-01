import { type InvoiceStatus } from '@common/constants/invoice-status'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'

export interface InvoicePaymentPanelsArgs {
  currencyData?: CurrencyItemType
  invoiceId: number
  invoiceStatus: InvoiceStatus
}
