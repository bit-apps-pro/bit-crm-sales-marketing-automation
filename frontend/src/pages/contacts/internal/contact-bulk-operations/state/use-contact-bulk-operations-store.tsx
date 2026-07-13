import { create } from 'zustand'

interface ContactBulkOperationsStore {
  isAddTagModalOpen: boolean
  isDeleteModalOpen: boolean
  isRemoveTagModalOpen: boolean

  setAddTagModalOpen: (isOpen: boolean) => void
  setDeleteModalOpen: (isOpen: boolean) => void
  setRemoveTagModalOpen: (isOpen: boolean) => void
}

const useContactBulkOperationsStore = create<ContactBulkOperationsStore>(set => ({
  isAddTagModalOpen: false,
  isDeleteModalOpen: false,
  isRemoveTagModalOpen: false,

  setAddTagModalOpen: isOpen => set({ isAddTagModalOpen: isOpen }),
  setDeleteModalOpen: isOpen => set({ isDeleteModalOpen: isOpen }),
  setRemoveTagModalOpen: isOpen => set({ isRemoveTagModalOpen: isOpen })
}))

export default useContactBulkOperationsStore
