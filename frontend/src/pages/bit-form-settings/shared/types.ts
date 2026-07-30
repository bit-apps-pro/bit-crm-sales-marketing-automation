import { type Response } from '@common/helpers/request'

export const BITFORM_ABSENT_CODE = 'bitform_absent'

export interface BitFormUrls {
  editForm: string
  editIntegration: string
  preview: string
  viewEntries: string
}

export interface BitFormListItem {
  createdAt: string
  entriesCount: number
  formId: number
  formName: string
  formStatus: 0 | 1 | 2
  integrationId: number
  integrationStatus: number
  shortcode: string
  urls: BitFormUrls
}

export interface BitFormFormsResponse {
  bitformProActive: boolean
  forms: BitFormListItem[]
}

export interface LeadFormTemplate {
  description: string
  slug: string
  title: string
}

export interface CreateLeadFormPayload {
  closeAfterCreate?: boolean
  crm?: {
    newTagTitles?: string[]
    tagIds?: number[]
  }
  returnUrl?: string
  templateSlug?: string
  title: string
}

// The form is not created server-side: the SPA opens createUrl in a new tab,
// where Bit Form's builder creates + auto-saves it. It shows up in the forms
// list only after that save.
export interface CreateLeadFormResponse {
  createUrl: string
}

// The global Response type narrows `code` to its three success-path values,
// but rejected requests surface backend codes like `bitform_absent` verbatim.
export type BitFormApiError = Omit<Response<null>, 'code'> & { code: string }
