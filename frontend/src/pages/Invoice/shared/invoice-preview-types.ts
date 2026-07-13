import {
  type DiscountType,
  type LineItem,
  type TaxOption
} from '@features/product-line-items/shared/types'
import {
  type ContactInformation,
  type CurrencyItemType,
  type DealInformation,
  type SectionType
} from '@pages/invoice-create/shared/invoice-create-types'

export interface InvoicePreviewData {
  bottomSectionNotes: SectionType[]
  contact?: ContactInformation
  currencyData?: CurrencyItemType
  deal?: DealInformation
  dueDate?: string
  grossDiscountAmount: number
  grossDiscountType: DiscountType
  invoiceDate?: string
  invoiceNumber: number | string
  invoicePrefix?: string
  invoiceTermKey?: string
  lineItems: LineItem[]
  taxOption: TaxOption
  topSectionNotes: SectionType[]
}
