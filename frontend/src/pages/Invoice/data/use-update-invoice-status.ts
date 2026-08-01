import { type InvoiceStatus } from '@common/constants/invoice-status'
import NotifyContext from '@common/context/NotifyContext'
import queryRequest, { type Response } from '@common/helpers/request'
import { type InvoiceType } from '@pages/invoice-create/shared/invoice-create-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

interface UpdateInvoiceStatusPayload {
  id: number | string
  status: InvoiceStatus
}

interface InvoiceData {
  invoice: InvoiceType
}

export default function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  interface MutationContext {
    previousData: Response<InvoiceData> | undefined
  }

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    UpdateInvoiceStatusPayload,
    MutationContext
  >({
    mutationFn: async payload =>
      queryRequest(`invoices/${payload.id}/status`, { status: payload.status }),
    mutationKey: ['invoices', 'update-status'],
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['invoice', Number(variables.id)], context.previousData)
      }
      messageApi?.error(error.message || error.data)
    },
    onMutate: async variables => {
      const queryKey = ['invoice', Number(variables.id)]
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<Response<InvoiceData>>(queryKey)

      queryClient.setQueryData<Response<InvoiceData>>(queryKey, old => {
        if (!old?.data?.invoice) return old

        return create(old, draft => {
          draft.data.invoice.status = variables.status as InvoiceType['status']
        })
      })

      return { previousData }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', Number(variables.id)] })
      queryClient.invalidateQueries({
        queryKey: ['activity-logs', 'index', Number(variables.id), 'invoice']
      })
    },
    onSuccess: () => {
      messageApi?.success('Invoice status updated successfully')
    }
  })

  return {
    isUpdateStatusPending: isPending,
    updateInvoiceStatus: mutateAsync
  }
}
