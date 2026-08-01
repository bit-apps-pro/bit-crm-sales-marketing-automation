import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest, { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { formatInvoicePaymentError } from '../shared/format-invoice-payment-error'

interface ShareLinkResponse {
  published: boolean
  url: string
}

export default function useInvoiceShareLink() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { data, isPending, mutateAsync, reset } = useMutation<
    Response<ShareLinkResponse>,
    Response<string>,
    { id: number }
  >({
    mutationFn: payload => queryRequest(`invoices/${payload.id}/share-link`),
    mutationKey: ['invoices', 'share-link'],
    onError: error => {
      messageApi?.error(formatInvoicePaymentError(error, __('Failed to generate share link')))
    },
    onSuccess: (response, variables) => {
      if (!response.data?.published) {
        return
      }

      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'index'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'deals'] })
      queryClient.invalidateQueries({ queryKey: ['activity-logs', 'index', variables.id, 'invoice'] })
    }
  })

  return {
    generateShareLink: mutateAsync,
    isShareLinkPending: isPending,
    resetShareLink: reset,
    shareUrl: data?.data?.url
  }
}
