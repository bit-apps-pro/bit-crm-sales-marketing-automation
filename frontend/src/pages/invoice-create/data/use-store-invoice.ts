import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest from '@common/helpers/request'
import { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { type InvoiceType, type StoreInvoicePayloadType } from '../shared/invoice-create-types'

export default function useStoreInvoice() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()
  const { isPending, mutateAsync } = useMutation<
    Response<InvoiceType>,
    Response<string>,
    StoreInvoicePayloadType
  >({
    mutationFn: invoiceData => queryRequest('invoices/store', invoiceData),
    mutationKey: ['invoices', 'store'],
    onError: error => {
      messageApi?.error(error.message || __('Failed to create invoice.'))
    },
    onSuccess: res => {
      messageApi?.success(res?.message || __('Invoice created successfully.'))
      queryClient.invalidateQueries({ queryKey: ['invoices', 'last-id'] })
    }
  })

  return {
    isStorePending: isPending,
    storeInvoice: mutateAsync
  }
}
