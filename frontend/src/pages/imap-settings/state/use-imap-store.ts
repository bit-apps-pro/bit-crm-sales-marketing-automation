import { create } from 'zustand'

interface ImapStore {
  handleModal: (
    type: string,
    setSearchParams: (params: string | { id?: string; modal: string }) => void,
    searchParamData?: { id?: string; modal: string }
  ) => void
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  setCreateModalOpen: (isOpen: boolean) => void
  setEditModalOpen: (isOpen: boolean) => void
}

const useImapStore = create<ImapStore>(set => ({
  handleModal: (type, setSearchParams, searchParamData) => {
    if (type != 'open' || !searchParamData) {
      setSearchParams('')
      return
    }

    setSearchParams(searchParamData)
  },
  isCreateModalOpen: false,
  isEditModalOpen: false,
  setCreateModalOpen: (isOpen: boolean) => set({ isCreateModalOpen: isOpen }),
  setEditModalOpen: (isOpen: boolean) => set({ isEditModalOpen: isOpen })
}))

export default useImapStore
