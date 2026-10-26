import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '@pages/Layout/ui/header/nav-items'
import { navGroups } from '@pages/settings-layout/internal/settings-sidebar'
import { LuFileText, LuPlus, LuSettings } from 'react-icons/lu'

import { toAbsolutePath } from '../shared/search-utils'
import { type NavigationEntry, type ScopeOption } from '../shared/types'

/*
  Everything the modal can open without a request: the header's pages, every settings
  screen and the tabs inside them, and the create actions. The header and settings
  sidebar lists are reused so a page added there is searchable without touching this file;
  only tabs and actions, which have no shared list, are spelled out here. Products and
  workflows are pro: only their upgrade pages exist here, so they have no filter or
  create action.
*/

const PAGE_KEYWORDS: Record<string, string> = {
  calendar: 'schedule agenda',
  dashboard: 'home overview stats',
  history: 'activity log audit',
  workflows: 'automation automations'
}

const SETTINGS_KEYWORDS: Record<string, string> = {
  'ai-assistant': 'openai claude gemini chat model api key',
  'api-settings': 'rest api key token',
  'crm-users': 'team members permissions roles access',
  currencies: 'money exchange rate',
  'data-management': 'import export recycle bin trash logs uninstall',
  'general-settings': 'business company profile logo address',
  'imap-settings': 'email inbox sync mail',
  'invoice-settings': 'prefix payment terms',
  'mcp-server': 'ai agent claude chatgpt connector',
  'portal-settings': 'client customer portal white label',
  'smtp-settings': 'email outgoing mail sender',
  'woo-settings': 'woocommerce store shop orders'
}

const getSettingsTabs = () => [
  {
    capability: CAPABILITIES.SETTING.LEAD,
    label: __('Lead Fields'),
    path: 'lead-settings?tab=field-settings'
  },
  {
    capability: CAPABILITIES.SETTING.LEAD,
    keywords: 'convert',
    label: __('Lead Conversion Mapping'),
    path: 'lead-settings?tab=conversion-mapping'
  },
  {
    capability: CAPABILITIES.SETTING.CONTACT,
    label: __('Contact Fields'),
    path: 'contact-settings?tab=field-settings'
  },
  {
    capability: CAPABILITIES.SETTING.COMPANY,
    label: __('Company Fields'),
    path: 'company-settings?tab=field-settings'
  },
  {
    capability: CAPABILITIES.SETTING.DEAL,
    label: __('Deal Fields'),
    path: 'deal-settings?tab=field-settings'
  },
  {
    capability: CAPABILITIES.SETTING.DEAL,
    keywords: 'pipeline',
    label: __('Deal Stages'),
    path: 'deal-settings?tab=stages'
  },
  {
    capability: CAPABILITIES.SETTING.DEAL,
    label: __('Archived Deal Stages'),
    path: 'deal-settings?tab=archived-stages'
  },
  {
    capability: CAPABILITIES.SETTING.PRODUCT,
    label: __('Product Fields'),
    path: 'product-settings?tab=field-settings'
  },
  {
    capability: CAPABILITIES.SETTING.INVOICE,
    label: __('Invoice Prefix'),
    path: 'invoice-settings?tab=prefix-settings'
  },
  {
    capability: CAPABILITIES.SETTING.INVOICE,
    label: __('Payment Terms'),
    path: 'invoice-settings?tab=configure-payment-terms'
  },
  {
    capability: CAPABILITIES.SETTING.INVOICE,
    keywords: 'stripe paypal gateway checkout',
    label: __('Invoice Payments'),
    path: 'invoice-settings?tab=payments'
  },
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    keywords: 'trash deleted restore',
    label: __('Recycle Bin'),
    path: 'data-management?tab=recycle-bin'
  },
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    label: __('Imports'),
    path: 'data-management?tab=imports'
  },
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    label: __('Exports'),
    path: 'data-management?tab=exports'
  },
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    label: __('History Logs'),
    path: 'data-management?tab=activity-logs'
  },
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    label: __('Workflow Logs'),
    path: 'data-management?tab=workflow'
  },
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    label: __('Uninstall'),
    path: 'data-management?tab=uninstall'
  },
  {
    capability: CAPABILITIES.SETTING.PORTAL,
    label: __('Portal Permissions'),
    path: 'portal-settings?tab=permissions'
  },
  {
    capability: CAPABILITIES.SETTING.PORTAL,
    label: __('Portal Clients'),
    path: 'portal-settings?tab=clients'
  },
  {
    capability: CAPABILITIES.SETTING.PORTAL,
    keywords: 'branding',
    label: __('Portal White Label'),
    path: 'portal-settings?tab=white-label'
  },
  { capability: CAPABILITIES.SETTING.USER, label: __('CRM Roles'), path: 'crm-users?tab=roles' },
  {
    capability: CAPABILITIES.SETTING.WORKFLOW,
    keywords: 'automation',
    label: __('Workflow Settings'),
    path: 'workflow-settings'
  }
]

const getCreateActionList = () => [
  { capability: CAPABILITIES.LEAD.CREATE, label: __('Create Lead'), path: '/leads/create' },
  { capability: CAPABILITIES.CONTACT.CREATE, label: __('Create Contact'), path: '/contacts/create' },
  { capability: CAPABILITIES.COMPANY.CREATE, label: __('Create Company'), path: '/companies/create' },
  { capability: CAPABILITIES.DEAL.CREATE, label: __('Create Deal'), path: '/deals/create' },
  { capability: CAPABILITIES.INVOICE.CREATE, label: __('Create Invoice'), path: '/invoices/create' }
]

export const getScopeOptions = (): ScopeOption[] =>
  (
    [
      { capability: CAPABILITIES.LEAD.VIEW, key: 'lead', label: __('Leads') },
      { capability: CAPABILITIES.CONTACT.VIEW, key: 'contact', label: __('Contacts') },
      { capability: CAPABILITIES.COMPANY.VIEW, key: 'company', label: __('Companies') },
      { capability: CAPABILITIES.DEAL.VIEW, key: 'deal', label: __('Deals') },
      { capability: CAPABILITIES.INVOICE.VIEW, key: 'invoice', label: __('Invoices') },
      { capability: CAPABILITIES.ACTIVITY.VIEW, key: 'task', label: __('Tasks') },
      { capability: CAPABILITIES.ACTIVITY.VIEW, key: 'meeting', label: __('Meetings') },
      { capability: CAPABILITIES.ACTIVITY.VIEW, key: 'call', label: __('Calls') },
      { capability: CAPABILITIES.NOTE.VIEW, key: 'note', label: __('Notes') }
    ] satisfies (ScopeOption & { capability: string })[]
  ).filter(option => checkCapability(option.capability))

const canOpen = (entry: NavigationEntry) => entry.capability.every(checkCapability)

const buildNavigationEntries = () => {
  const pageGroup = __('Pages')
  const settingsGroup = __('Settings')

  const pages = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS].map(item => ({
    capability: [item.capability],
    group: pageGroup,
    icon: <LuFileText />,
    key: `page:${item.key}`,
    keywords: PAGE_KEYWORDS[item.key],
    label: item.label,
    path: toAbsolutePath(item.path)
  }))

  const settings = navGroups.flatMap(group =>
    group.items.map(item => {
      const slug = item.path.split('/').at(-1) as string

      return {
        capability: [CAPABILITIES.SETTING.MENU, item.capability],
        group: settingsGroup,
        icon: item.icon,
        key: `settings:${slug}`,
        keywords: `${group.title} ${SETTINGS_KEYWORDS[slug] ?? ''}`,
        label: item.label,
        path: toAbsolutePath(item.path)
      }
    })
  )

  const tabs = getSettingsTabs().map(tab => ({
    capability: [CAPABILITIES.SETTING.MENU, tab.capability],
    group: settingsGroup,
    icon: <LuSettings />,
    key: `settings:${tab.path}`,
    keywords: tab.keywords,
    label: tab.label,
    path: '/settings/' + tab.path
  }))

  const actions = getCreateActionList().map(action => ({
    capability: [action.capability],
    group: __('Actions'),
    icon: <LuPlus />,
    key: `action:${action.path}`,
    keywords: 'new add',
    label: action.label,
    path: action.path
  }))

  return {
    actions: actions.filter(canOpen),
    entries: [...pages, ...settings, ...tabs, ...actions].filter(canOpen)
  }
}

let cached: ReturnType<typeof buildNavigationEntries> | undefined

/** Built on first use: capabilities are fixed for the page load, so the lists are too. */
export const getNavigationEntries = () => (cached ??= buildNavigationEntries()).entries

/** The create actions on their own, for the empty-query view. */
export const getCreateActions = () => (cached ??= buildNavigationEntries()).actions
