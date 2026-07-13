import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useDeleteImap() {
  const { messageApi } = useContext(NotifyContext)

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    number
  >({
    mutationFn: (id: number) => queryRequest('imaps/delete', { id }),
    mutationKey: ['delete', 'imap'],
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
    deleteImap: mutateAsync,
    isDeletingImap: isPending
  }
}
