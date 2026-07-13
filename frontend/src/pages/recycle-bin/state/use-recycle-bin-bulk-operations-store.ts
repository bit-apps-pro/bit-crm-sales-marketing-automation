import { create } from 'zustand'

interface RecycleBinBulkOperationStore {
  actions: {
    setDeleteModalOpen: (isOpen: boolean) => void
    setRestoreModalOpen: (isOpen: boolean) => void
  }
  isDeleteModalOpen: boolean
  isRestoreModalOpen: boolean
}

const useRecycleBinBulkOperationStore = create<RecycleBinBulkOperationStore>(set => ({
  actions: {
    setDeleteModalOpen: isOpen => set({ isDeleteModalOpen: isOpen }),
    setRestoreModalOpen: isOpen => set({ isRestoreModalOpen: isOpen })
  },
  isDeleteModalOpen: false,
  isRestoreModalOpen: false
}))

export const useIsDeleteModalOpen = () =>
  useRecycleBinBulkOperationStore(state => state.isDeleteModalOpen)
export const useIsRestoreModalOpen = () =>
  useRecycleBinBulkOperationStore(state => state.isRestoreModalOpen)

export const useRecycleBinBulkOperationsStoreActions = () =>
  useRecycleBinBulkOperationStore(state => state.actions)
