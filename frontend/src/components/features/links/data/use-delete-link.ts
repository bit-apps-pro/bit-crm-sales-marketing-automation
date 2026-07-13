import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useDeleteLink() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    number | string
  >({
    mutationFn: (id: number | string) => queryRequest('links/delete', { id }),
    mutationKey: ['links', 'delete'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      messageApi?.success(data.data)
      queryClient.invalidateQueries({ queryKey: ['links'] })
      queryClient.invalidateQueries({ queryKey: ['entity-related-lists-count'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    deleteLink: mutateAsync,
    isDeletingLink: isPending
  }
}
