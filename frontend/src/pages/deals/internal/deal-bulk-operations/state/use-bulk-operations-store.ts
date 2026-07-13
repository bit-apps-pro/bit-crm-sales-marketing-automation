import { create } from 'zustand'

interface BulkOperationsStore {
  actions: {
    setAttachTagsModalOpen: (isOpen: boolean) => void
    setDeleteModalOpen: (isOpen: boolean) => void
    setDetachTagsModalOpen: (isOpen: boolean) => void
  }
  isAttachTagsModalOpen: boolean
  isDeleteModalOpen: boolean
  isDetachTagsModalOpen: boolean
}

const useBulkOperationsStore = create<BulkOperationsStore>(set => ({
  actions: {
    setAttachTagsModalOpen: isOpen => set({ isAttachTagsModalOpen: isOpen }),
    setDeleteModalOpen: isOpen =>
      set({
        isDeleteModalOpen: isOpen
      }),
    setDetachTagsModalOpen: isOpen => set({ isDetachTagsModalOpen: isOpen })
  },
  isAttachTagsModalOpen: false,
  isDeleteModalOpen: false,
  isDetachTagsModalOpen: false
}))

export const useIsAttachTagsModalOpenStore = () =>
  useBulkOperationsStore(state => state.isAttachTagsModalOpen)
export const useIsDetachTagsModalOpenStore = () =>
  useBulkOperationsStore(state => state.isDetachTagsModalOpen)
export const useIsDeleteModalOpenStore = () => useBulkOperationsStore(state => state.isDeleteModalOpen)

export const useBulkOperationActionsStore = () => useBulkOperationsStore(state => state.actions)
