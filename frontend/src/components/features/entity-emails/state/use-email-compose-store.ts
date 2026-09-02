import { create } from 'zustand'

export interface ReplyTarget {
  id: number
  subject: string
}

interface EmailComposeStore {
  handleComposeClose: () => void
  handleComposeOpen: (replyTo?: ReplyTarget) => void
  isComposeOpen: boolean
  replyTo: ReplyTarget | undefined
}

const useEmailComposeStore = create<EmailComposeStore>(set => ({
  handleComposeClose: () => {
    set({ isComposeOpen: false, replyTo: undefined })
  },
  handleComposeOpen: replyTo => {
    set({ isComposeOpen: true, replyTo })
  },
  isComposeOpen: false,
  replyTo: undefined
}))

export default useEmailComposeStore
