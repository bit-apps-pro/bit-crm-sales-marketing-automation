import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedRelatedEntityKeysStore {
  actions: {
    clearSelectedKeys: () => void
    setSelectedKeys: (selectedKeys: Key[]) => void
  }
  selectedKeys: Key[]
}

const useSelectedRelatedEntityKeysStore = create<SelectedRelatedEntityKeysStore>(set => ({
  actions: {
    clearSelectedKeys: () => set({ selectedKeys: [] }),
    setSelectedKeys: selectedKeys => set({ selectedKeys })
  },
  selectedKeys: []
}))

export const useSelectedKeys = () => useSelectedRelatedEntityKeysStore(state => state.selectedKeys)
export const useRelatedEntityKeysStoreActions = () =>
  useSelectedRelatedEntityKeysStore(state => state.actions)
