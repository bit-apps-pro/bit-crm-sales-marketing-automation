import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest, { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Dayjs } from 'dayjs'
import { useContext } from 'react'

import { formatInvoicePaymentError } from '../shared/format-invoice-payment-error'

interface ManualPaymentPayload {
  id: number
  note?: string
  /**
   * When the money was received, as the picker's own value — serialized to
   * ISO-8601 UTC on the wire, the same as `invoice_date`/`due_date`.
   */
  paid_at: Dayjs
  reference?: string
}

/**
 * Records an offline settlement against an invoice ("Mark as Paid").
 *
 * Hits the FREE namespace: the payment ledger lives in free so the records
 * outlive the pro plugin.
 *
 * No optimistic update: the invoice status is derived server-side from the
 * payment ledger, so guessing it here could show a status the ledger never
 * produced. The panels refresh from the invalidated queries instead.
 */
export default function useRecordManualPayment() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<null>,
    Response<Record<string, string[]> | string>,
    ManualPaymentPayload
  >({
    mutationFn: payload =>
      queryRequest(
        `invoices/${payload.id}/manual-payment`,
        {
          note: payload.note,
          paid_at: payload.paid_at,
          reference: payload.reference
        },
        undefined,
        'POST'
      ),
    mutationKey: ['invoices', 'manual-payment'],
    onError: error => {
      messageApi?.error(formatInvoicePaymentError(error, __('Could not record the payment')))
    },
    onSettled: (_, __unused, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['activity-logs', 'index', variables.id, 'invoice'] })
    },
    onSuccess: response => {
      messageApi?.success(response.message || __('Payment recorded successfully'))
    }
  })

  return {
    isRecordingManualPayment: isPending,
    recordManualPayment: mutateAsync
  }
}
