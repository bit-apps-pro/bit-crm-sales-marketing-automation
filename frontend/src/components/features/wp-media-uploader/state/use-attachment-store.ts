import { create } from 'zustand'

export interface Attachment {
  file_name: string
  file_size_in_bytes: number
  media_id: number
  media_url: string
  mime: string
}

interface AttachmentStore {
  addAttachments: (attachments: Attachment[]) => void
  attachments: Attachment[]
  clearAttachments: () => void
  removeAttachment: (id: number) => void
  setAttachments: (data: Attachment[]) => void
}

const useAttachmentStore = create<AttachmentStore>(set => ({
  addAttachments: attachments =>
    set(state => ({
      attachments: [...state.attachments, ...attachments]
    })),
  attachments: [],
  clearAttachments: () => set({ attachments: [] }),
  removeAttachment: id =>
    set(state => ({
      attachments: state.attachments.filter(attachment => attachment.media_id !== id)
    })),
  setAttachments: data =>
    set(() => ({
      attachments: data
    }))
}))

export default useAttachmentStore
