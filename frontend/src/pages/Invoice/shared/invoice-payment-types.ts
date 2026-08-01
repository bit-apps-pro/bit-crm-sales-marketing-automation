export type InvoicePaymentStatus = 'cancelled' | 'completed' | 'failed' | 'pending' | 'refunded'

export type MinimumPaymentType = 'amount' | 'percentage'

export interface InvoicePaymentItem {
  amount: string
  created_at: string
  currency: null | string
  entity_id: number
  /** Invoice→store-currency rate locked when the payment was created. */
  fx_rate: null | string
  id: number
  module: string
  paid_at: null | string
  /** Refunded portion in the invoice currency (derived server-side at the locked rate). */
  refunded_amount?: string
  status: InvoicePaymentStatus
  /** Amount the WooCommerce order charges, in wc_currency. */
  wc_amount: null | string
  /** WooCommerce store currency the order was created in. */
  wc_currency: null | string
  wc_order_id: number
  /** Cumulative refunded total of the order, in wc_currency. */
  wc_refunded_amount?: null | string
}

export interface InvoicePaymentSummary {
  currency: string
  /** Minor-unit precision of the invoice currency; absent in cached pre-upgrade payloads. */
  decimal_places?: number
  due: number
  minimum_payment_amount: number
  paid: number
  total: number
}

export type WooPaymentUnavailableReason = 'currency_not_supported' | 'disabled' | 'woo_inactive'

export interface InvoiceWooPaymentContext {
  available: boolean
  currency_supported: boolean
  enabled: boolean
  home_currency: string
  reason: null | WooPaymentUnavailableReason
  woo_active: boolean
  woo_currency: null | string
}

export interface InvoicePaymentsResponse {
  is_payable: boolean
  is_woo_active: boolean
  minimum_payment_type: MinimumPaymentType
  minimum_payment_value: number
  partial_payment_allowed: boolean
  payments: InvoicePaymentItem[]
  summary: InvoicePaymentSummary | null
  woo_payment: InvoiceWooPaymentContext
}
