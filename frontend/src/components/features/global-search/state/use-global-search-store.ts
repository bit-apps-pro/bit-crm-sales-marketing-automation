import config from '@config/config'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { type RecentItem } from '../shared/types'

const MAX_RECENT = 8

interface GlobalSearchStore {
  actions: {
    addRecentItem: (item: RecentItem) => void
    addRecentTerm: (term: string) => void
    clearRecent: () => void
  }
  recentItems: RecentItem[]
  recentTerms: string[]
}

/*
  Recent searches and opened results, kept in this browser only. The key carries the
  user id so two people sharing a browser on the same site do not see each other's
  history. When storage is unavailable, persist degrades to in-memory for the session.
*/
const useGlobalSearchStore = create<GlobalSearchStore>()(
  persist(
    set => ({
      actions: {
        addRecentItem: item =>
          set(state => ({
            recentItems: [item, ...state.recentItems.filter(recent => recent.id !== item.id)].slice(
              0,
              MAX_RECENT
            )
          })),
        addRecentTerm: term => {
          const trimmed = term.trim()
          if (!trimmed) return

          set(state => ({
            recentTerms: [
              trimmed,
              ...state.recentTerms.filter(recent => recent.toLowerCase() !== trimmed.toLowerCase())
            ].slice(0, MAX_RECENT)
          }))
        },
        clearRecent: () => set({ recentItems: [], recentTerms: [] })
      },
      recentItems: [],
      recentTerms: []
    }),
    {
      name: `bit-crm-global-search-${config.CURRENT_USER_ID ?? '0'}`,
      partialize: state => ({ recentItems: state.recentItems, recentTerms: state.recentTerms })
    }
  )
)

export const useRecentItems = () => useGlobalSearchStore(state => state.recentItems)
export const useRecentTerms = () => useGlobalSearchStore(state => state.recentTerms)
export const useGlobalSearchActions = () => useGlobalSearchStore(state => state.actions)
