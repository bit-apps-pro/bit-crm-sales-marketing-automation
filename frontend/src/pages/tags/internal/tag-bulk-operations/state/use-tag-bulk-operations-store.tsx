import { create } from 'zustand'

interface TagBulkOperationsStore {
  actions: {
    setTrashModalOpen: (isOpen: boolean) => void
  }
  isTrashModalOpen: boolean
}
const useTagBulkOperationsStore = create<TagBulkOperationsStore>(set => ({
  actions: {
    setTrashModalOpen: isOpen => set({ isTrashModalOpen: isOpen })
  },
  isTrashModalOpen: false
}))

export const useIsTrashModalOpen = () => useTagBulkOperationsStore(state => state.isTrashModalOpen)
export const useTagBulkOperationsStoreActions = () => useTagBulkOperationsStore(state => state.actions)
