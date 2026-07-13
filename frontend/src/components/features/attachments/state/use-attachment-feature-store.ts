import { create } from 'zustand'

interface AttachmentFeatureStore {
  handleModal: (
    type: string,
    setSearchParams: (params: string | { id?: string; modal: string }) => void,
    searchParamData?: { id?: string; modal: string }
  ) => void
  isCreateModalOpen: boolean
  setCreateModalOpen: (isOpen: boolean) => void
}

const useAttachmentFeatureStore = create<AttachmentFeatureStore>(set => ({
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
  isCreateModalOpen: false,
  setCreateModalOpen: (isOpen: boolean) => set({ isCreateModalOpen: isOpen })
}))

export default useAttachmentFeatureStore
