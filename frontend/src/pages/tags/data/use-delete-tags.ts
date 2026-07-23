import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface DeletePayload {
  ids: number[]
}

type ResponseData = null | {
  message?: string
}

export default function useDeleteTags() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()
  const { isPending, mutateAsync } = useMutation<
    Response<ResponseData>,
    Response<string>,
    DeletePayload
  >({
    mutationFn: ({ ids }) => queryRequest('tags/delete', { tagsId: ids }),
    mutationKey: ['tags', 'delete'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      messageApi?.success(data.message || __('Tags deleted successfully.'))
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    }
  })
  return {
    deleteTags: mutateAsync,
    isDeletingTags: isPending
  }
}
