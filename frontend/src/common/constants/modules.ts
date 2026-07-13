import { __ } from '@common/helpers/i18nWrap'

export const MODULES = {
  COMPANY: 'company',
  CONTACT: 'contact',
  DEAL: 'deal',
  INVOICE: 'invoice',
  LEAD: 'lead',
  PRODUCT: 'product',
  USER: 'user'
} as const

export type ModuleValue = (typeof MODULES)[keyof typeof MODULES]

export const MODULES_PLURAL: Record<string, string> = {
  [MODULES.COMPANY]: 'companies',
  [MODULES.CONTACT]: 'contacts',
  [MODULES.DEAL]: 'deals',
  [MODULES.LEAD]: 'leads',
  [MODULES.PRODUCT]: 'products'
} as const

export const MODULE_OPTIONS: { disabled?: boolean; label: string; value: ModuleValue }[] = [
  { label: __('Lead'), value: MODULES.LEAD },
  { label: __('Contact'), value: MODULES.CONTACT },
  { label: __('Company'), value: MODULES.COMPANY },
  { label: __('Deal'), value: MODULES.DEAL },
  { label: __('Product'), value: MODULES.PRODUCT },
  { label: __('Invoice'), value: MODULES.INVOICE }
]

export const PRO_MODULES = [MODULES.PRODUCT]

export const getFilteredModuleOptions = (excludedModules: ModuleValue[]) => {
  return MODULE_OPTIONS.filter(option => !excludedModules.includes(option.value))
}
