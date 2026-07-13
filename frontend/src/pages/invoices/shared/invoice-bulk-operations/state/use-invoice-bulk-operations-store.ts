import { create } from 'zustand'

interface InvoiceBulkOperationsStore {
  actions: {
    setTrashModalOpen: (isOpen: boolean) => void
  }
  isTrashModalOpen: boolean
}
const useInvoiceBulkOperationsStore = create<InvoiceBulkOperationsStore>(set => ({
  actions: {
    setTrashModalOpen: isOpen => set({ isTrashModalOpen: isOpen })
  },
  isTrashModalOpen: false
}))

export const useIsTrashModalOpen = () => useInvoiceBulkOperationsStore(state => state.isTrashModalOpen)
export const useInvoiceBulkOperationsStoreActions = () =>
  useInvoiceBulkOperationsStore(state => state.actions)
