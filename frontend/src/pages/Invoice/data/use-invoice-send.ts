import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface SendInvoicePayload {
  id: string
}

export default function useInvoiceSend() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()
  const { data, isError, isPending, mutateAsync } = useMutation<
    Response<SendInvoicePayload>,
    Response<string>,
    SendInvoicePayload
  >({
    mutationFn: ({ id }) => queryRequest('invoices/send', { id }),
    mutationKey: ['invoices', 'send'],
    onError: error => {
      if (typeof error.data === 'object') {
        const messages = Object.values(error.data).flat().join(' ')
        messageApi?.error(messages || error.message)
        return
      }

      messageApi?.error(error.message || error.data)
    },
    onSuccess: (_, variables) => {
      messageApi?.success(__('Invoice sent successfully'))
      queryClient.invalidateQueries({ queryKey: ['invoice', Number(variables.id)] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({
        queryKey: ['activity-logs', 'index', Number(variables.id), 'invoice']
      })
      queryClient.invalidateQueries({ queryKey: ['emails'] })
    }
  })
  if (isError) {
    console.error(isError)
  }
  return {
    email: data,
    isSendingEmail: isPending,
    sendEmail: mutateAsync
  }
}
