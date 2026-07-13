import { create } from 'zustand'

interface BulkOperationsStore {
  isAttachTagsModalOpen: boolean
  isDeleteModalOpen: boolean
  isDetachTagsModalOpen: boolean

  setAttachTagsModalOpen: (isOpen: boolean) => void
  setDeleteModalOpen: (isOpen: boolean) => void
  setDetachTagsModalOpen: (isOpen: boolean) => void
}

const useBulkOperationsStore = create<BulkOperationsStore>(set => ({
  isAttachTagsModalOpen: false,
  isDeleteModalOpen: false,
  isDetachTagsModalOpen: false,
  setAttachTagsModalOpen: isOpen => set({ isAttachTagsModalOpen: isOpen }),
  setDeleteModalOpen: isOpen =>
    set({
      isDeleteModalOpen: isOpen
    }),
  setDetachTagsModalOpen: isOpen => set({ isDetachTagsModalOpen: isOpen })
}))

export default useBulkOperationsStore
