import { __ } from '@common/helpers/i18nWrap'

import { type LeadFormTemplate } from './types'

export const LEAD_FORM_TEMPLATE_SLUGS = {
  CONTACT_FORM: 'contact_form'
} as const

export const LEAD_FORM_TEMPLATES: Record<string, LeadFormTemplate> = {
  [LEAD_FORM_TEMPLATE_SLUGS.CONTACT_FORM]: {
    description: __('Name, email and message fields'),
    slug: LEAD_FORM_TEMPLATE_SLUGS.CONTACT_FORM,
    title: __('Contact Form')
  }
}

export const LEAD_FORM_TEMPLATE_LIST = Object.values(LEAD_FORM_TEMPLATES)

export const UPCOMING_TEMPLATE_PLACEHOLDER: LeadFormTemplate = {
  description: __('More lead capture templates are on the way.'),
  slug: '__upcoming__',
  title: __('More templates coming soon')
}

export const DEFAULT_LEAD_FORM_TEMPLATE_SLUG = LEAD_FORM_TEMPLATE_SLUGS.CONTACT_FORM

export const getLeadFormTemplateBySlug = (slug?: string): LeadFormTemplate | undefined =>
  slug ? LEAD_FORM_TEMPLATES[slug] : undefined
