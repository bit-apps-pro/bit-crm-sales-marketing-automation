import { create } from 'zustand'

interface TermsStore {
  actions: {
    handleModal: (
      type: string,
      setSearchParams: (params: string | { id?: string; modal: string }) => void,
      searchParamData?: { id?: string; modal: string }
    ) => void
    setCreateModalOpen: (isOpen: boolean) => void
    setEditModalOpen: (isOpen: boolean) => void
  }
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
}

const useTermsStore = create<TermsStore>(set => ({
  actions: {
    handleModal: (type, setSearchParams, searchParamData) => {
      const currentParams = new URLSearchParams(window.location.hash.split('?')[1])

      if (type === 'open' && searchParamData) {
        Object.entries(searchParamData).forEach(([key, value]) => {
          if (value !== undefined) {
            currentParams.set(key, value)
          }
        })

        setSearchParams(currentParams.toString())
        return
      }

      currentParams.delete('modal')
      currentParams.delete('id')
      setSearchParams(currentParams.toString())
    },
    setCreateModalOpen: isOpen => set({ isCreateModalOpen: isOpen }),
    setEditModalOpen: isOpen => set({ isEditModalOpen: isOpen })
  },
  isCreateModalOpen: false,
  isEditModalOpen: false
}))

export const useTermsStoreActions = () => useTermsStore(state => state.actions)
export const useIsTermCreateModalOpen = () => useTermsStore(state => state.isCreateModalOpen)
export const useIsTermEditModalOpen = () => useTermsStore(state => state.isEditModalOpen)
