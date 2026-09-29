import { type ProductOptionData } from '@components/features/product-lookup-select/shared/types'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'

export interface LineItem {
  description?: string
  discount_percentage?: number
  entity_id?: number
  id: string
  module?: string
  product_code?: string
  /** VARCHAR since db 1.0.5: a CRM id, or an external one such as a SureCart price UUID. */
  product_id?: number | string
  product_name?: string
  product_source: string
  quantity: number
  tax_rate: number
  total_price_in_deal_currency?: number
  total_price_in_home_currency?: number
  unit_price_in_deal_currency?: number
  unit_price_in_home_currency?: number
}

export interface ProductLineItemsTableProps {
  allowCustomSource?: boolean
  calculateLineTotal: (item: LineItem) => number
  currencyData: CurrencyItemType
  lineItems: LineItem[]
  onRemove: (id: string) => void
  onSelectProduct: (lineItemId: string, productData: ProductOptionData, dealCurrency?: string) => void
  onUpdate: (id: string, field: keyof LineItem, value: number | string | undefined) => void
  productSource?: string
}

export type TaxOption = 'exclusive' | 'inclusive' | 'no_tax'

export type DiscountType = 'amount' | 'rate'

export interface ProductSummaryProps {
  currencyData: CurrencyItemType
  grossDiscount?: number
  grossDiscountOptions?: {
    editable?: boolean
    enabled?: boolean
  }
  grossDiscountType?: DiscountType
  localLineItems: LineItem[]
  taxOption?: TaxOption
}

export interface ProductLineItemsProps {
  allowCustomSource?: boolean
  className?: string
  currencyData: CurrencyItemType
  localLineItems: LineItem[]
  setLocalLineItems: (updater: ((prevState: LineItem[]) => LineItem[]) | LineItem[]) => void
}
