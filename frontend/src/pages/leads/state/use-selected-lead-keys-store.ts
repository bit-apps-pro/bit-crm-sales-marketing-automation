import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedLeadKeys {
  actions: {
    clearSelectedKeys: () => void
    setSelectedKeys: (selectedKeys: Key[]) => void
  }
  selectedKeys: Key[]
}
const useSelectedLeadKeysStore = create<SelectedLeadKeys>(set => ({
  actions: {
    clearSelectedKeys: () => set({ selectedKeys: [] }),
    setSelectedKeys: selectedKeys => set({ selectedKeys })
  },
  selectedKeys: []
}))

export const useLeadStoreSelectedKeys = () => useSelectedLeadKeysStore(state => state.selectedKeys)
export const useLeadStoreKeysActions = () => useSelectedLeadKeysStore(state => state.actions)
