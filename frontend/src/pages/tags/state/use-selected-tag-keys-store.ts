import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedTagKeysStore {
  actions: {
    clearSelectedKeys: () => void
    clearStore: () => void
    setSelectedKeys: (selectedKeys: Key[]) => void
  }
  selectedKeys: Key[]
}

const useSelectedTagKeysStore = create<SelectedTagKeysStore>(set => ({
  actions: {
    clearSelectedKeys: () => set({ selectedKeys: [] }),
    clearStore: () => set({ selectedKeys: [] }),
    setSelectedKeys: selectedKeys => set({ selectedKeys })
  },
  selectedKeys: []
}))

export const useTagStoreSelectedKeys = () => useSelectedTagKeysStore(state => state.selectedKeys)
export const useTagStoreKeysActions = () => useSelectedTagKeysStore(state => state.actions)
