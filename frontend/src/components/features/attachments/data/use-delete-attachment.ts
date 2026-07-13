import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useDeleteAttachment() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending: isDeletingAttachment, mutateAsync: deleteAttachment } = useMutation<
    Response<string>,
    Response<string>,
    number
  >({
    mutationFn: (id: number) => queryRequest('attachments/delete', { id }),
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: () => {
      messageApi?.success(__('Attachment deleted successfully'))
      queryClient.invalidateQueries({ queryKey: ['attachments'] })
      queryClient.invalidateQueries({ queryKey: ['entity-related-lists-count'] })
    }
  })

  return {
    deleteAttachment,
    isDeletingAttachment
  }
}
