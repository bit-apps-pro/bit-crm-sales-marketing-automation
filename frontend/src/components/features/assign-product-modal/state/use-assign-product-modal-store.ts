import { create } from 'zustand'

interface AssignProductModalStore {
  actions: {
    setIsModalOpen: (isOpen: boolean) => void
  }
  isModalOpen: boolean
}

const useAssignProductModalStore = create<AssignProductModalStore>(set => ({
  actions: {
    setIsModalOpen: (open: boolean) => set({ isModalOpen: open })
  },
  isModalOpen: false
}))

export const useAssignProductModalStoreActions = () => useAssignProductModalStore(state => state.actions)

export const useIsAssignProductModalOpenSelect = () =>
  useAssignProductModalStore(state => state.isModalOpen)
