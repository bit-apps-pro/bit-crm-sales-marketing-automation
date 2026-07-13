import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface DeletePayload {
  key: string
}

export default function useDeleteTerm() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()
  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, DeletePayload>({
    mutationFn: key => queryRequest('invoices/terms/delete', key, undefined, 'POST'),
    mutationKey: ['invoices', 'terms', 'delete'],
    onError: error => {
      messageApi?.error(error.message || __('Failed to delete term'))
    },
    onSuccess: data => {
      messageApi?.success(data.message || __('Term deleted successfully'))
      queryClient.invalidateQueries({ queryKey: ['invoices', 'terms'] })
    }
  })
  return {
    deleteTerm: mutateAsync,
    isDeletingTerm: isPending
  }
}
