import { type ReactNode } from 'react'

/** A record group the server searches, or `pages` for the in-app navigation index. */
export type SearchScope =
  | 'all'
  | 'call'
  | 'company'
  | 'contact'
  | 'deal'
  | 'invoice'
  | 'lead'
  | 'meeting'
  | 'note'
  | 'pages'
  | 'product'
  | 'task'
  | 'workflow'

export interface ScopeOption {
  key: Exclude<SearchScope, 'all'>
  label: string
}

/** A page, settings screen or action the modal can open without asking the server. */
export interface NavigationEntry {
  capability: string[]
  group: string
  icon: ReactNode
  key: string
  keywords?: string
  label: string
  path: string
}

export interface SearchResultItem {
  id: number
  path: string
  subtitle: string
  title: string
}

export interface SearchResultGroup {
  items: SearchResultItem[]
  key: Exclude<SearchScope, 'all' | 'pages'>
  label: string
  listPath: null | string
  /** Every match, of which `items` holds the best few. */
  total: number
}

/** One selectable row, whatever produced it; the modal's keyboard focus moves over these. */
export interface SearchOption {
  groupLabel?: string
  icon: ReactNode
  /** Set on anything worth listing under "Recently opened". */
  iconKey?: string
  id: string
  onSelect?: () => void
  path?: string
  subtitle?: string
  title: string
}

export interface RecentItem {
  group: string
  /** Key into the modal's icon map, since a rendered icon cannot be persisted. */
  iconKey: string
  id: string
  path: string
  subtitle?: string
  title: string
}
