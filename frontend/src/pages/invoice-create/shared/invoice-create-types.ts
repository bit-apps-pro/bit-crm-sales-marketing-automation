import { type LineItem, type TaxOption } from '@features/product-line-items/shared/types'
import { type ContactType } from '@pages/contact/shared/contact-types'
import { type Deal } from '@pages/deal/shared/deal-types'

export interface InvoiceType {
  amount?: number
  bottom_section_notes: SectionType[]
  color: string
  currency?: string
  deal_name: string
  due_date: string
  entity_id: number | string
  gross_discount_amount: number
  gross_discount_type: GrossDiscountType
  home_currency_amount?: number
  id: number
  invoice_date: Date
  invoice_prefix: string
  module: string
  status: InvoiceStatus
  tax_option: TaxOption
  term_key: string
  top_section_notes: SectionType[]
}
export interface LogoType {
  file_name: string
  file_size_in_bytes: number
  media_id: number
  media_url: string
  mime: string
}

export type InvoiceStatus = 'draft' | 'overdue' | 'paid' | 'sent'

export interface SectionType {
  label: string
  value: string
}

export interface StoreInvoicePayloadType {
  bottom_section_notes: SectionType[]
  currency: string
  due_date: string
  entity_id: number
  gross_discount_amount?: number
  gross_discount_type: GrossDiscountType
  invoice_date: string
  invoice_prefix: string
  line_items: LineItem[]
  logo?: LogoType
  module: string
  tax_option: 'exclusive' | 'inclusive' | 'no_tax'
  term_key: string
  top_section_notes: SectionType[]
}

export interface InvoiceFormType {
  dueDate: string
  invoiceDate: string
  invoicePrefix: string
  invoiceTerm: string
}

type GrossDiscountType = 'amount' | 'rate'

export type ContactInformation = Pick<
  ContactType,
  | 'billing_address_line_1'
  | 'billing_address_line_2'
  | 'billing_city'
  | 'billing_country'
  | 'billing_county'
  | 'billing_state'
  | 'billing_zip'
  | 'email'
  | 'first_name'
  | 'id'
  | 'last_name'
  | 'phone'
  | 'title'
>
export type DealInformation = Pick<Deal, 'email' | 'name'> & {
  contact_id: number | string
  currency: string
  id: number | string
  isDealSelected?: boolean
}

export interface CurrencyItemType {
  currency: string
  decimal_places: number
  decimal_separator: string
  exchange_rate?: string
  is_active?: boolean
  is_home?: boolean
  label: string
  numeral_system: string
  symbol: string
  thousand_separator: string
}
