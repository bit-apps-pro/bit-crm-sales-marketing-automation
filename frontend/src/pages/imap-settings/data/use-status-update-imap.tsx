import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useStatusUpdateImap() {
  const { messageApi } = useContext(NotifyContext)

  interface StatusUpdateType {
    id: number
    status: boolean
  }

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    StatusUpdateType
  >({
    mutationFn: data => queryRequest('imaps/update-status', data),
    mutationKey: ['update', 'status', 'imap'],
    onError: error => {
      messageApi?.error(error.data)
    },
    onSuccess: data => {
      messageApi?.success(data.data)
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingStatus: isPending,
    updateStatus: mutateAsync
  }
}
