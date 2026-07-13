import NotifyContext from '@common/context/NotifyContext'
import queryRequest, { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export type DeleteMethod = 'delete' | 'trash'
interface DeletePayload {
  ids: number[]
}

export default function useDeleteInvoices() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, DeletePayload>({
    mutationFn: ({ ids }) => queryRequest('invoices/trash', { ids }),
    mutationKey: ['invoices', 'trash'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'index'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'deals'] })

      messageApi?.success(data.message)
    }
  })

  return {
    deleteInvoices: mutateAsync,
    isDeletingInvoices: isPending
  }
}
