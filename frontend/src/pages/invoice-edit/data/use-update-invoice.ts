import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest, { type Response } from '@common/helpers/request'
import { type InvoiceType } from '@pages/invoice-create/shared/invoice-create-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { type UpdateInvoicePayloadType } from '../shared/invoice-edit-types'

export default function useUpdateInvoice() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)
  const { isPending, mutateAsync } = useMutation<
    Response<InvoiceType>,
    Response<string>,
    UpdateInvoicePayloadType
  >({
    mutationFn: async invoiceData =>
      queryRequest(`invoices/${invoiceData.id}`, invoiceData, undefined, 'POST'),
    mutationKey: ['invoices', 'update'],
    onError: error => {
      messageApi?.error(error.message || __('Failed to update invoice.'))
    },
    onSuccess: res => {
      messageApi?.success(res?.message || __('Invoice updated successfully.'))
      queryClient.invalidateQueries({ queryKey: ['invoice'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })

  return {
    isUpdatePending: isPending,
    updateInvoice: mutateAsync
  }
}
