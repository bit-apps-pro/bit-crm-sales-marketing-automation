import { type Product } from '@common/types/product'

export interface ProductOption {
  data?: Partial<Product>
  is_parent?: boolean
  label: string
  value: number | string
}

export interface ProductLookupSelectProps {
  allowCustomSource?: boolean
  className?: string
  disabled?: boolean
  enableWooProducts?: boolean
  name?: string
  onNameChange?: (name: string) => void
  onSelect?: (option: ProductOption) => void
  onSourceChange?: (source: string) => void
  productSource: string
  refetch?: boolean
  value?: number | string
}
