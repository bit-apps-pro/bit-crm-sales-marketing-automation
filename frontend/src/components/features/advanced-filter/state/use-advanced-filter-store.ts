import { create } from 'zustand'

import { NEW_FILTER } from '../shared/constants'
import { type FilterCondition } from '../shared/types'

interface AdvancedFilterStore {
  actions: {
    setFilterGroups: (groups: FilterCondition[][]) => void
    setGroupErrors: (errors: Record<string, string[]>) => void
    setPopoverOpen: (open: boolean) => void
  }
  filterGroups: FilterCondition[][]
  groupErrors: Record<string, string[]>
  isPopoverOpen: boolean
}

const useAdvancedFilterStore = create<AdvancedFilterStore>(set => ({
  filterGroups: [[NEW_FILTER]],
  groupErrors: {},
  isPopoverOpen: false,

  actions: {
    setFilterGroups: groups => set({ filterGroups: groups }),
    setGroupErrors: errors => set({ groupErrors: errors }),
    setPopoverOpen: open => set({ isPopoverOpen: open })
  }
}))

export const useFilterGroups = () => useAdvancedFilterStore(state => state.filterGroups)
export const useIsPopoverOpen = () => useAdvancedFilterStore(state => state.isPopoverOpen)
export const useGroupErrors = () => useAdvancedFilterStore(state => state.groupErrors)
export const useAdvancedFilterActions = () => useAdvancedFilterStore(state => state.actions)
