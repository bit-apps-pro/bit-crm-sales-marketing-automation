import { MODULES } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface DeleteTagEntityData {
  deal_id?: number | string
  tag_id?: number
}

export default function useDeleteTagEntity() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)
  const { isPending, mutateAsync } = useMutation<
    Response<DeleteTagEntityData>,
    Response<string> | Response<ValidationType<DeleteTagEntityData>>,
    DeleteTagEntityData
  >({
    mutationFn: deleteTagEntityData =>
      queryRequest('deals/detach-tag', deleteTagEntityData, undefined, 'POST'),
    mutationKey: ['deals', 'detach-tag'],
    onError: error => {
      if (typeof error.data === 'string') return messageApi?.error(error.message || error.data)
      return messageApi?.error(__('Could not remove tag.'))
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['deal', Number(payload.deal_id)] })
      queryClient.invalidateQueries({ queryKey: ['tags', MODULES.DEAL] })
      messageApi?.success(__('Tag removed successfully'))
    }
  })

  return {
    deleteTagEntity: mutateAsync,
    isTagEntityDeleting: isPending
  }
}
