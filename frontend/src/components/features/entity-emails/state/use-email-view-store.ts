import { create } from 'zustand'

import { type FormattedEmailData } from '../shared/types'

interface EmailViewStore {
  currentEmailData: FormattedEmailData | undefined
  handleViewClose: () => void
  handleViewOpen: (emailId: number, emailsData: FormattedEmailData[]) => void
  isViewOpen: boolean
  setIsViewOpen: (isOpen: boolean) => void
}

const useEmailViewStore = create<EmailViewStore>(set => ({
  currentEmailData: undefined,
  handleViewClose: () => {
    set({ currentEmailData: undefined, isViewOpen: false })
  },
  handleViewOpen: (emailId, emailsData) => {
    if (!emailId || !emailsData || !Array.isArray(emailsData)) return

    const emailData = emailsData.find(email => email.id === emailId)

    if (!emailData) return

    set({
      currentEmailData: emailData,
      isViewOpen: true
    })
  },
  isViewOpen: false,
  setIsViewOpen: isOpen => {
    set({ isViewOpen: isOpen })
  }
}))

export default useEmailViewStore
