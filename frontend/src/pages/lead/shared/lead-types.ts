import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type TagItemType } from '@pages/tags/shared/tag-types'
import { type QueryObserverResult } from '@tanstack/react-query'

export interface LeadTagType {
  id?: number
  slug: string
  title: string
}

export interface DateFieldType {
  field_type: 'date'
  field_value: string
}
export interface LeadResType {
  data: LeadType
}
export interface LeadType {
  [key: string]: DateFieldType | unknown
  annual_revenue?: number
  billing_city?: string
  billing_country?: string
  billing_state?: string
  billing_street?: string
  billing_zip?: string
  company_name?: string
  conversion_details?: string
  created_at: string
  created_by_name?: string
  description?: string
  email: string
  first_name: string
  id: number
  industry?: string
  is_converted?: boolean
  last_name?: string
  lead_source?: string
  lead_status?: string
  next_id: null | number
  owner_id?: number
  phone?: string
  previous_id: null | number
  shipping_city?: string
  shipping_country?: string
  shipping_state?: string
  shipping_street?: string
  shipping_zip?: string
  status?: boolean
  tags: LeadTagType[]
  title: string
  updated_at?: string
  updated_by_name?: string
  website?: string
}
export interface TagResType {
  data: TagItemType[]
}

export interface LeadOverviewPropsType {
  columnSettings?: boolean | { column_size: number }
  fields: FieldItem[]
  lead: LeadType
  refetchLead: () => Promise<QueryObserverResult<LeadResType, Error>>
  refetchTags: () => Promise<QueryObserverResult<TagResType, Error>>
  tags: TagItemType[]
}

export interface ConvertSingleLeadResponse {
  convertedContactId: number | string
}

export interface ConvertSingleLeadPayload {
  convertTo: string[]
  dealFieldOverrides: {
    customFieldsValues: Record<string, unknown>
    systemDefinedFieldsValues: Record<string, unknown>
  }
  defaultOwnerId?: number | string
  id: number | string
  moveRelatedData: string[]
  moveRelatedDataTo: string
  moveTagsTo: string[]
}
