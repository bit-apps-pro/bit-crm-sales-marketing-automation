import { type LineItem } from '@features/product-line-items/shared/types'
import { type LogoType, type SectionType } from '@pages/invoice-create/shared/invoice-create-types'

export interface UpdateInvoicePayloadType {
  bottom_section_notes: SectionType[]
  currency: string
  due_date: string
  id: number | string
  invoice_date: string
  invoice_prefix: string
  line_items: LineItem[]
  logo?: LogoType
  status?: InvoiceStatus
  tax_option: 'exclusive' | 'inclusive' | 'no_tax'
  term_key: string
  top_section_notes: SectionType[]
}

type InvoiceStatus = 'draft' | 'paid' | 'sent'
