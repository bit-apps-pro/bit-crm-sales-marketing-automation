import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type TagItemType } from '@pages/tags/shared/tag-types'
import { type QueryObserverResult } from '@tanstack/react-query'

export interface ContactTagType {
  id?: number
  slug: string
  title: string
}

export interface DateFieldType {
  field_type: 'date'
  field_value: string
}

export interface ContactResType {
  data: ContactType
}

export interface ContactType {
  [key: string]: DateFieldType | unknown
  assistant?: string
  assistant_phone?: string
  billing_address_line_1?: string
  billing_address_line_2?: string
  billing_city?: string
  billing_country?: string
  billing_county?: string
  billing_state?: string
  billing_zip?: string
  company_id?: number
  company_name?: string
  created_at: string
  created_by_name?: string
  date_of_birth?: string
  department?: string
  description?: string
  email?: string
  fax?: string
  first_name: string
  id: number
  last_name: string
  lead_source?: string
  mobile?: string
  next_id: null | number
  owner_id?: number
  parent_id?: number
  parent_name?: string
  phone?: string
  previous_id: null | number
  secondary_email?: string
  shipping_address_line_1?: string
  shipping_address_line_2?: string
  shipping_city?: string
  shipping_country?: string
  shipping_county?: string
  shipping_state?: string
  shipping_zip?: string
  status?: boolean
  tags: ContactTagType[]
  title?: string
  updated_at?: string
  updated_by_name?: string
}

export interface TagResType {
  data: TagItemType[]
}

export interface ContactOverviewPropsType {
  columnSettings?: boolean | { column_size: number }
  contact: ContactType
  fields: FieldItem[]
  refetchContact: () => Promise<QueryObserverResult<ContactResType, Error>>
  refetchTags: () => Promise<QueryObserverResult<TagResType, Error>>
  tags: TagItemType[]
}

export interface DeleteTagEntityPayloadType {
  contact_id?: string
  tag_id?: number
}
