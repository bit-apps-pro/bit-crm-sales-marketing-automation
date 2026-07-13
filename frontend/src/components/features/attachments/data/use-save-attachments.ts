import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface AttachmentData {
  attachments: Attachment[]
  entity_id: number
  module: string
}

export default function useSaveAttachment() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending: isSavingAttachment, mutateAsync: saveAttachment } = useMutation<
    Response<string>,
    Response<string>,
    AttachmentData
  >({
    mutationFn: (data: AttachmentData) => queryRequest('attachments/store', data, undefined, 'POST'),
    onError: error => {
      console.error(error)
      messageApi?.error(error.message || error.data)
    },
    onSuccess: response => {
      messageApi?.success(
        typeof response.data === 'string' ? response.data : __('Attachment(s) created successfully')
      )
      queryClient.invalidateQueries({ queryKey: ['attachments'] })
      queryClient.invalidateQueries({
        queryKey: ['entity-related-lists-count']
      })
    }
  })

  return {
    isSavingAttachment,
    saveAttachment
  }
}
