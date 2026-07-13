import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type TagItemType } from '@pages/tags/shared/tag-types'

export interface CompanyTagType {
  id?: number
  slug: string
  title: string
}

export interface DateFieldType {
  field_type: 'date'
  field_value: string
}

export interface CompanyResType {
  data: CompanyType
}
export interface CompanyType {
  [key: string]: unknown
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
  created_at: string
  created_by_name?: string
  description?: string
  email?: string
  employees_number?: number
  fax?: string
  id: number
  industry?: string
  name: string
  next_id?: number
  owner_id?: number
  owner_name?: string
  parent_id?: number
  parent_name?: string
  phone?: string
  previous_id?: number
  rating?: string
  shipping_address_line_1?: string
  shipping_address_line_2?: string
  shipping_city?: string
  shipping_country?: string
  shipping_county?: string
  shipping_state?: string
  shipping_zip?: string
  status?: boolean
  tags: CompanyTagType[]
  ticker_symbol?: string
  type?: string
  updated_at?: string
  updated_by_name?: string
  website?: string
}

export interface TagResType {
  data: TagItemType[]
}

export interface CompanyOverviewPropsType {
  columnSettings?: boolean | { column_size: number }
  company: CompanyType
  fields: FieldItem[]
  refetchCompany: () => void
  refetchTags: () => void
  tags: CompanyTagType[]
}
