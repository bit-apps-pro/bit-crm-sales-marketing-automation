export interface ProductTag {
  id?: number
  slug: string
  title: string
}

export interface Product {
  [key: string]: unknown
  brand?: string
  code: string
  cost_price?: number
  created_at: string
  created_by_name?: string
  description?: string
  id: number
  name: string
  next_id?: number
  previous_id?: number
  price?: number
  source?: string
  status?: string
  tags: ProductTag[]
  tax_rate?: number
  type?: string
  updated_at?: string
  updated_by_name?: string
}
