import NotifyContext from '@common/context/NotifyContext'
import { type ProcessedFieldsResult } from '@common/helpers/format-module-fields-values'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Deal } from '@pages/deal/shared/deal-types'
import { useDealsKanbanActionsStore } from '@pages/deals/internal/deals-kanban/state/use-deals-kanban-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

export interface UpdateDealPayload extends ProcessedFieldsResult {
  lineItems?: Deal['lineItems']
}

export default function useUpdateDeal(form: FormInstance) {
  const { clearStore } = useDealsKanbanActionsStore()
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<ProcessedFieldsResult>,
    Response<string> | Response<ValidationType<Deal>>,
    UpdateDealPayload
  >({
    mutationFn: payload => queryRequest(`deals/${payload.id}`, payload),
    mutationKey: ['deals', 'update-deal'],
    onError: error => {
      if (typeof error.data === 'object') {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
        return
      }

      messageApi?.error(error.message || error.data)
    },
    onSuccess: (_, payload) => {
      clearStore()
      messageApi?.success(__('Deal updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['deal', Number(payload.id)] })
      queryClient.invalidateQueries({ queryKey: ['activity-logs', 'index'] })
    }
  })

  return {
    isUpdatePending: isPending,
    updateDeal: mutateAsync
  }
}
