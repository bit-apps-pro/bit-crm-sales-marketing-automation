import { create } from 'zustand'

interface AddFieldModalStore {
  actions: {
    reset: () => void
    setModalOpen: (open: boolean) => void
    setType: (type: string | undefined) => void
  }
  isModalOpen: boolean
  type: string | undefined
}

const useAddFieldModalStore = create<AddFieldModalStore>(set => ({
  actions: {
    reset: () => set({ isModalOpen: false, type: undefined }),
    setModalOpen: (open: boolean) => set({ isModalOpen: open }),
    setType: (type: string | undefined) => set({ type })
  },
  isModalOpen: false,
  type: undefined
}))

export const useIsAddFieldModalOpen = () => useAddFieldModalStore(state => state.isModalOpen)
export const useAddFieldType = () => useAddFieldModalStore(state => state.type)
export const useAddFieldModalActions = () => useAddFieldModalStore(state => state.actions)
