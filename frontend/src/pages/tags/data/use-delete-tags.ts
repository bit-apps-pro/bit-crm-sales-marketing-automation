import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface DeletePayload {
  ids: number[]
}

export default function useDeleteTags() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()
  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, DeletePayload>({
    mutationFn: ({ ids }) => queryRequest('tags/delete', { tagsId: ids }),
    mutationKey: ['tags', 'delete'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      messageApi?.success(data.data)
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    }
  })
  return {
    deleteTags: mutateAsync,
    isDeletingTags: isPending
  }
}
