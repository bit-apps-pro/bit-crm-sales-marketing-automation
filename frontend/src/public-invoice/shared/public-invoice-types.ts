import { type LineItem } from '@features/product-line-items/shared/types'
import { type BusinessSettings } from '@pages/general-settings/internal/business-settings/shared/types'
import {
  type ContactInformation,
  type CurrencyItemType,
  type DealInformation,
  type InvoiceType
} from '@pages/invoice-create/shared/invoice-create-types'
import {
  type InvoicePaymentItem,
  type InvoicePaymentSummary,
  type MinimumPaymentType
} from '@pages/Invoice/shared/invoice-payment-types'

/** Availability-only variant of the Woo payment context on the public page. */
export interface PublicWooPayment {
  available: boolean
  woo_currency: null | string
}

export interface PublicInvoiceResponse {
  business_settings: BusinessSettings
  contact: ContactInformation
  currency_data: CurrencyItemType
  deal: DealInformation
  invoice: InvoiceType
  is_payable: boolean
  is_woo_active: boolean
  line_items: LineItem[]
  minimum_payment_type: MinimumPaymentType
  minimum_payment_value: number
  partial_payment_allowed: boolean
  payment_summary: InvoicePaymentSummary | null
  payments: InvoicePaymentItem[]
  term_name?: string
  woo_payment?: PublicWooPayment
}

export function getPublicInvoiceContext() {
  return SERVER_VARIABLES.publicInvoice
}
