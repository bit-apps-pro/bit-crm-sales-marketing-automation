import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { type FilterCondition } from '../shared/types'

interface AdvanceFilterPersistStore {
  actions: {
    clearActiveFilters: (moduleName: string) => void
    getActiveFilters: (moduleName: string) => FilterCondition[][]
    setActiveFilters: (filters: FilterCondition[][], moduleName: string) => void
  }
  activeFilters: Record<string, FilterCondition[][]>
}

const useAdvanceFilterPersistStore = create<AdvanceFilterPersistStore>()(
  persist(
    (set, get) => ({
      actions: {
        clearActiveFilters: moduleName => {
          set(state => ({
            activeFilters: {
              ...state.activeFilters,
              [moduleName]: []
            }
          }))
        },
        getActiveFilters: moduleName => {
          return get().activeFilters[moduleName] || []
        },
        setActiveFilters: (filters, moduleName) =>
          set(state => ({
            activeFilters: {
              ...state.activeFilters,
              [moduleName]: filters
            }
          }))
      },
      activeFilters: {}
    }),
    { name: 'advance-filters-storage', partialize: state => ({ activeFilters: state.activeFilters }) }
  )
)

export const useActiveFilters = () => useAdvanceFilterPersistStore(state => state.activeFilters)
export const useAdvanceFilterActions = () => useAdvanceFilterPersistStore(state => state.actions)
