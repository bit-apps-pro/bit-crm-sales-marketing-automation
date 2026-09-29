export type InvoicePaymentStatus = 'cancelled' | 'completed' | 'failed' | 'pending' | 'refunded'

export type MinimumPaymentType = 'amount' | 'percentage'

export interface InvoicePaymentItem {
  amount: string
  /** Amount the provider checkout charges, in charged_currency. */
  charged_amount: null | string
  /** Checkout currency of the provider the payment was created in. */
  charged_currency: null | string
  /** Cumulative refunded total of the checkout, in charged_currency. */
  charged_refunded_amount: null | string
  created_at: string
  currency: null | string
  entity_id: number
  /** Invoice→checkout-currency rate locked when the payment was created. */
  fx_rate: null | string
  id: number
  /** True for an offline settlement recorded by an admin, not collected by a provider. */
  is_manual: boolean
  module: string
  /** Admin's note on an offline settlement; null for provider rows. */
  note: null | string
  paid_at: null | string
  /** Checkout engine that collected this payment (e.g. 'woocommerce'). */
  provider: string
  /** What collected the money, for display: "Manual" or the provider's name. */
  provider_label: string
  /** The provider's order/charge reference. */
  provider_ref: string
  /** Display name of the admin who recorded a manual settlement; null when unknown. */
  recorded_by: null | string
  /** Merchant's own reference for an offline settlement (cheque no., txn id). */
  reference: null | string
  /** Refunded portion in the invoice currency (derived server-side at the locked rate). */
  refunded_amount: string
  status: InvoicePaymentStatus
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

/**
 * A payment row as the public share page receives it: only what it renders.
 * The admin's note, who recorded a manual row and the provider/ledger
 * references never leave the server for an anonymous visitor.
 */
export type PublicPaymentItem = Pick<
  InvoicePaymentItem,
  | 'amount'
  | 'charged_amount'
  | 'charged_currency'
  | 'currency'
  | 'id'
  | 'is_manual'
  | 'paid_at'
  | 'refunded_amount'
  | 'status'
>

/**
 * `invoices/{id}/payments` in the free plugin: the ledger rows and the
 * total/paid/due summary. Collecting payments online is pro, so none of the
 * checkout-side fields ever reach the free bundle.
 */
export interface InvoicePaymentsResponse {
  payments: InvoicePaymentItem[]
  summary: InvoicePaymentSummary | null
}
