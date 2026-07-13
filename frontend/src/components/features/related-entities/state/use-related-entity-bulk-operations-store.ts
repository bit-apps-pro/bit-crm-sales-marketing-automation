import { create } from 'zustand'

interface RelatedEntityBulkOperationsStore {
  actions: {
    setDetachModalOpen: (isOpen: boolean) => void
  }
  isDetachModalOpen: boolean
}

const useRelatedEntityBulkOperationsStore = create<RelatedEntityBulkOperationsStore>(set => ({
  actions: {
    setDetachModalOpen: isOpen => set({ isDetachModalOpen: isOpen })
  },
  isDetachModalOpen: false
}))

export const useRelatedEntityBulkOperationsStoreActions = () =>
  useRelatedEntityBulkOperationsStore(state => state.actions)
export const useRelatedEntityIsDetachModalOpen = () =>
  useRelatedEntityBulkOperationsStore(state => state.isDetachModalOpen)
