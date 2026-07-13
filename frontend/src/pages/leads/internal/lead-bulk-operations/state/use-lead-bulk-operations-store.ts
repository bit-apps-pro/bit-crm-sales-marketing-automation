import { create } from 'zustand'

interface LeadBulkOperationsStore {
  isAddTagModalOpen: boolean
  isConversionModalOpen: boolean
  isDeleteModalOpen: boolean
  isRemoveTagModalOpen: boolean

  setAddTagModalOpen: (isOpen: boolean) => void
  setConversionModalOpen: (isOpen: boolean) => void
  setDeleteModalOpen: (isOpen: boolean) => void
  setRemoveTagModalOpen: (isOpen: boolean) => void
}

const useLeadBulkOperationsStore = create<LeadBulkOperationsStore>(set => ({
  isAddTagModalOpen: false,
  isConversionModalOpen: false,
  isDeleteModalOpen: false,
  isRemoveTagModalOpen: false,

  setAddTagModalOpen: isOpen => set({ isAddTagModalOpen: isOpen }),
  setConversionModalOpen: isOpen => set({ isConversionModalOpen: isOpen }),
  setDeleteModalOpen: isOpen => set({ isDeleteModalOpen: isOpen }),
  setRemoveTagModalOpen: isOpen => set({ isRemoveTagModalOpen: isOpen })
}))

export default useLeadBulkOperationsStore
