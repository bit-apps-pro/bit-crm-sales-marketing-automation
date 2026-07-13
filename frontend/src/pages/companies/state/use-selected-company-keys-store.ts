import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedCompanyKeysStore {
  actions: {
    clearSelectedKeys: () => void
    setSelectedKeys: (selectedKeys: Key[]) => void
  }
  selectedKeys: Key[]
}

const useSelectedCompanyKeysStore = create<SelectedCompanyKeysStore>(set => ({
  actions: {
    clearSelectedKeys: () => set({ selectedKeys: [] }),
    setSelectedKeys: selectedKeys => set({ selectedKeys })
  },
  selectedKeys: []
}))

export const useSelectedKeys = () => useSelectedCompanyKeysStore(state => state.selectedKeys)
export const useCompanyKeysStoreActions = () => useSelectedCompanyKeysStore(state => state.actions)
