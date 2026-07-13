import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedContactKeys {
  actions: {
    clearSelectedKeys: () => void
    setSelectedKeys: (selectedKeys: Key[]) => void
  }
  selectedKeys: Key[]
}

const useSelectedContactKeysStore = create<SelectedContactKeys>(set => ({
  actions: {
    clearSelectedKeys: () => set({ selectedKeys: [] }),
    setSelectedKeys: selectedKeys => set({ selectedKeys })
  },
  selectedKeys: []
}))

export const useContactStoreSelectedKeys = () => useSelectedContactKeysStore(state => state.selectedKeys)
export const useContactStoreKeysActions = () => useSelectedContactKeysStore(state => state.actions)
