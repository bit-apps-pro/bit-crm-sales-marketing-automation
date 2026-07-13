import { create } from 'zustand'

interface EmailComposeStore {
  handleComposeClose: () => void
  handleComposeOpen: () => void
  isComposeOpen: boolean
}

const useEmailComposeStore = create<EmailComposeStore>(set => ({
  handleComposeClose: () => {
    set({ isComposeOpen: false })
  },
  handleComposeOpen: () => {
    set({ isComposeOpen: true })
  },
  isComposeOpen: false
}))

export default useEmailComposeStore
