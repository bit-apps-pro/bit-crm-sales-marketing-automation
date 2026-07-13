import { type Key } from 'react'
import { create } from 'zustand'

interface SelectedInvoiceKeysStore {
  actions: {
    clearSelectedKeys: () => void
    setSelectedKeys: (selectedKeys: (Key | string)[]) => void
  }
  selectedKeys: (Key | string)[]
}

const useSelectedInvoiceKeysStore = create<SelectedInvoiceKeysStore>(set => ({
  actions: {
    clearSelectedKeys: () => set({ selectedKeys: [] }),
    setSelectedKeys: selectedKeys => set({ selectedKeys })
  },
  selectedKeys: []
}))

export const useSelectedKeys = () => useSelectedInvoiceKeysStore(state => state.selectedKeys)
export const useInvoiceKeysStoreActions = () => useSelectedInvoiceKeysStore(state => state.actions)
