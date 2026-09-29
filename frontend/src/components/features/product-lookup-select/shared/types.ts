/**
 * What a product option carries in its `data` payload.
 *
 * Not the CRM Product entity: every source formats to this same shape, and
 * `id` is what gets stored as a line item's product_id — a CRM product id, a
 * WooCommerce or FluentCart variant id, or a SureCart price UUID. Hence the
 * union, and hence not reusing Product, whose own id really is numeric.
 */
export interface ProductOptionData {
  code?: string
  currency?: string
  description?: string
  id: number | string
  is_parent?: boolean
  name?: string
  price?: number | string
  price_excluding_tax?: number | string
  price_including_tax?: number | string
  sku?: string
  source?: string
  tax_rate?: number | string
}

export interface ProductOption {
  data?: ProductOptionData
  is_parent?: boolean
  label: string
  value: number | string
}

export interface ProductLookupSelectProps {
  allowCustomSource?: boolean
  className?: string
  disabled?: boolean
  enableFluentCartProducts?: boolean
  enableSureCartProducts?: boolean
  enableWooProducts?: boolean
  name?: string
  onNameChange?: (name: string) => void
  onSelect?: (option: ProductOption) => void
  onSourceChange?: (source: string) => void
  productSource: string
  refetch?: boolean
  value?: number | string
}
