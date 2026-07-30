import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useDeleteActivity() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    number | string
  >({
    mutationFn: (id: number | string) => queryRequest('activities/delete', { id }),
    mutationKey: ['activities', 'delete'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      messageApi?.success(data?.message || __('Item deleted successfully.'))
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['entity-related-lists-count'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    deleteActivity: mutateAsync,
    isDeletingActivity: isPending
  }
}
