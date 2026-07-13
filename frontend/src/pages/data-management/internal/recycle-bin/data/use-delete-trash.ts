import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useDeleteTrash() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, { ids: number[] }>({
    mutationFn: (payload: { ids: number[] }) => queryRequest('trashes/delete', payload),
    mutationKey: ['trashes', 'delete'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      messageApi?.success(data.data)
      queryClient.invalidateQueries({ queryKey: ['trashes', 'index'] })
    }
  })

  return {
    deleteTrash: mutateAsync,
    isDeletingTrash: isPending
  }
}
