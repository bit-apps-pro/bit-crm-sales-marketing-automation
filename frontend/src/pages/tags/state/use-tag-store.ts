import { create } from 'zustand'

export interface StoreType {
  actions: {
    getEditId: () => number
    handleEdit: (id: number) => void
    handleModal: (
      type: string,
      setSearchParams: (params: string | { id?: string; modal: string }) => void,
      searchParamData?: { id?: string; modal: string }
    ) => void
    setCreateModalOpen: (isOpen: boolean) => void
    setEditId: (id: number | undefined) => void
    setEditModalOpen: (isOpen: boolean) => void
  }
  editId: number | undefined
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
}

const useTagStore = create<StoreType>((set, get) => ({
  actions: {
    getEditId: () => get().editId ?? 0,
    handleEdit: (id: number) => {
      set({ editId: id, isEditModalOpen: true })
    },
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
    setCreateModalOpen: isCreateModalOpen => set({ isCreateModalOpen }),
    setEditId: id => set({ editId: id }),
    setEditModalOpen: (isEditModalOpen: boolean) => set({ isEditModalOpen })
  },
  editId: undefined,
  isCreateModalOpen: false,
  isEditModalOpen: false
}))

export const useIsCreateModalOpen = () => useTagStore(state => state.isCreateModalOpen)
export const useIsEditModalOpen = () => useTagStore(state => state.isEditModalOpen)
export const useEditId = () => useTagStore(state => state.editId)
export const useTagStoreActions = () => useTagStore(state => state.actions)
