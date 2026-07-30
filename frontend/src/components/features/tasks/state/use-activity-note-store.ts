import { create } from 'zustand'

interface ActivityNoteStore {
  actions: {
    handleModal: (
      type: string,
      setSearchParams: (params: string | { id?: string; modal: string }) => void,
      searchParamData?: { modal: string; noteId?: string }
    ) => void
    setCreateModalOpen: (isOpen: boolean) => void
  }
  isCreateModalOpen: boolean
}

const useActivityNoteStore = create<ActivityNoteStore>(set => ({
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

      currentParams.delete('noteId')
      currentParams.delete('modal')
      setSearchParams(currentParams.toString())
    },
    setCreateModalOpen: (isOpen: boolean) => set({ isCreateModalOpen: isOpen })
  },
  isCreateModalOpen: false
}))

export const useActivityNoteActions = () => useActivityNoteStore(state => state.actions)
export const useActivityNoteIsCreateModalOpen = () =>
  useActivityNoteStore(state => state.isCreateModalOpen)
