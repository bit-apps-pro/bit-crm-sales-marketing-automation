export interface DateFieldType {
  field_type: 'date'
  field_value: string
}
export interface FieldItem {
  field_key: string
  group_fields?: Record<string, FieldItem>
  help_text?: string
  id: number
  is_always_required?: boolean
  is_custom?: boolean
  is_visible?: boolean
  label: string
  module?: string
  name: string
  options?: Option[]
  required: boolean
  status: boolean
  tooltip?: string
  type: string
  width?: string
}
export interface ModuleTagType {
  id?: number
  slug: string
  title: string
}
export interface ModuleType {
  [key: string]: DateFieldType | unknown
  account_number?: string
  account_site?: string
  annual_revenue?: number
  billing_address_line_1?: string
  billing_address_line_2?: string
  billing_city?: string
  billing_country?: string
  billing_county?: string
  billing_state?: string
  billing_zip?: string
  company_id?: number
  company_name?: string
  contact_id?: number
  contact_name?: string
  created_at: string
  description?: string
  email?: string
  employees_number?: number
  fax?: string
  first_name?: string
  id: number
  industry?: string
  last_name?: string
  name: string
  owner_id?: number
  owner_name?: string
  ownership?: string
  parent_id?: number
  parent_name?: string
  phone?: string
  rating?: string
  shipping_address_line_1?: string
  shipping_address_line_2?: string
  shipping_city?: string
  shipping_country?: string
  shipping_county?: string
  shipping_state?: string
  shipping_zip?: string
  status?: boolean
  tags: ModuleTagType[]
  ticker_symbol?: string
  title?: string
  type?: string
  website?: string
}
interface Option {
  label: string
  value: string
}

export interface Order {
  field_key: string
  order: number
}
