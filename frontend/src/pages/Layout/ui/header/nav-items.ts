import CAPABILITIES from '@common/constants/capabilities'
import { __ } from '@common/helpers/i18nWrap'

/*
  The header's navigation, in one place.

  Three components render these: the pill bar and the "More" dropdown on desktop, and the
  drawer that replaces both below `lg`. Keeping the lists here means adding a page touches
  one file instead of three, and the mobile menu cannot silently drift out of step with
  the desktop one.

  The split between primary and secondary is a desktop layout concern -- only so many
  pills fit across the bar -- so the drawer, which scrolls, simply shows both.
*/

export interface HeaderNavItem {
  capability: string
  end?: boolean
  key: string
  label: string
  path: string
}

export const PRIMARY_NAV_ITEMS: HeaderNavItem[] = [
  {
    capability: CAPABILITIES.DASHBOARD,
    end: true,
    key: 'dashboard',
    label: __('Dashboard'),
    path: '../'
  },
  { capability: CAPABILITIES.LEAD.MENU, key: 'leads', label: __('Leads'), path: '../leads' },
  { capability: CAPABILITIES.CONTACT.MENU, key: 'contacts', label: __('Contacts'), path: '../contacts' },
  {
    capability: CAPABILITIES.COMPANY.MENU,
    key: 'companies',
    label: __('Companies'),
    path: '../companies'
  },
  { capability: CAPABILITIES.DEAL.MENU, key: 'deals', label: __('Deals'), path: '../deals' },
  { capability: CAPABILITIES.INVOICE.MENU, key: 'invoices', label: __('Invoices'), path: '../invoices' }
]

export const SECONDARY_NAV_ITEMS: HeaderNavItem[] = [
  { capability: CAPABILITIES.PRODUCT.MENU, key: 'products', label: __('Products'), path: '../products' },
  { capability: CAPABILITIES.ACTIVITY.VIEW, key: 'tasks', label: __('Tasks'), path: '/tasks' },
  { capability: CAPABILITIES.ACTIVITY.VIEW, key: 'meetings', label: __('Meetings'), path: '/meetings' },
  { capability: CAPABILITIES.ACTIVITY.VIEW, key: 'calls', label: __('Calls'), path: '/calls' },
  { capability: CAPABILITIES.TAG.MENU, key: 'tags', label: __('Tags'), path: '/tags' },
  {
    capability: CAPABILITIES.WORKFLOW.MENU,
    key: 'workflows',
    label: __('Workflows'),
    path: '/workflows'
  },
  { capability: CAPABILITIES.OTHERS.History, key: 'history', label: __('History'), path: '/history' }
]
