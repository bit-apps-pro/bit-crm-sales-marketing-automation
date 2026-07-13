import {
  type DiscountType,
  type LineItem,
  type TaxOption
} from '@features/product-line-items/shared/types'
import {
  type ContactInformation,
  type CurrencyItemType,
  type DealInformation,
  type InvoiceType,
  type SectionType
} from '@pages/invoice-create/shared/invoice-create-types'

import { type InvoicePreviewData } from './invoice-preview-types'

interface InvoiceResponseInput {
  contact?: ContactInformation
  currencyData?: CurrencyItemType
  deal?: DealInformation
  invoice: InvoiceType
  lineItems: LineItem[]
}

export function mapInvoiceResponseToPreviewData({
  contact,
  currencyData,
  deal,
  invoice,
  lineItems
}: InvoiceResponseInput): InvoicePreviewData {
  return {
    bottomSectionNotes: invoice.bottom_section_notes ?? [],
    contact,
    currencyData,
    deal,
    dueDate: invoice.due_date,
    grossDiscountAmount: invoice.gross_discount_amount ?? 0,
    grossDiscountType: invoice.gross_discount_type,
    invoiceDate: invoice.invoice_date ? String(invoice.invoice_date) : undefined,
    invoiceNumber: invoice.id,
    invoicePrefix: invoice.invoice_prefix,
    invoiceTermKey: invoice.term_key,
    lineItems,
    taxOption: invoice.tax_option as TaxOption,
    topSectionNotes: invoice.top_section_notes ?? []
  }
}

interface EditorStateInput {
  bottomSectionNotes: SectionType[]
  contact?: ContactInformation
  currencyData?: CurrencyItemType
  deal?: DealInformation
  formValues: {
    dueDate?: unknown
    invoiceDate?: unknown
    invoicePrefix?: string
    invoiceTerm?: string
  }
  grossDiscountAmount: number
  grossDiscountType: DiscountType
  invoiceNumber: number | string
  lineItems: LineItem[]
  taxOption: TaxOption
  topSectionNotes: SectionType[]
}

function toDateString(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  // dayjs objects have a format() method; fall back to String()
  if (typeof (value as { format?: unknown }).format === 'function') {
    return (value as { format: () => string }).format()
  }
  return String(value)
}

export function mapEditorStateToPreviewData({
  bottomSectionNotes,
  contact,
  currencyData,
  deal,
  formValues,
  grossDiscountAmount,
  grossDiscountType,
  invoiceNumber,
  lineItems,
  taxOption,
  topSectionNotes
}: EditorStateInput): InvoicePreviewData {
  return {
    bottomSectionNotes,
    contact,
    currencyData,
    deal,
    dueDate: toDateString(formValues.dueDate),
    grossDiscountAmount,
    grossDiscountType,
    invoiceDate: toDateString(formValues.invoiceDate),
    invoiceNumber,
    invoicePrefix: formValues.invoicePrefix,
    invoiceTermKey: formValues.invoiceTerm,
    lineItems,
    taxOption,
    topSectionNotes
  }
}
