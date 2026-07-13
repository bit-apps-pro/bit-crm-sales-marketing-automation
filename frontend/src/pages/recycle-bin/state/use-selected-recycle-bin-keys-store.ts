import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedRecycleBinKeysStore {
  actions: {
    clearSelectedKeys: () => void
    setSelectedKeys: (selectedKeys: Key[]) => void
  }
  selectedKeys: Key[]
}

const useSelectedRecycleBinKeysStore = create<SelectedRecycleBinKeysStore>(set => ({
  actions: {
    clearSelectedKeys: () => set({ selectedKeys: [] }),
    setSelectedKeys: selectedKeys => set({ selectedKeys })
  },
  selectedKeys: []
}))

export const useSelectedKeys = () => useSelectedRecycleBinKeysStore(state => state.selectedKeys)
export const useSelectedRecycleBinStoreActions = () =>
  useSelectedRecycleBinKeysStore(state => state.actions)
