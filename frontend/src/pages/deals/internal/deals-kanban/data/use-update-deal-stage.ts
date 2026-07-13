import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export interface UpdateStagePayload {
  amount?: number | string
  closed_at?: string
  id: number
  probability: number
  stage: string
}

export default function useUpdateDealStage() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isError, isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    UpdateStagePayload
  >({
    mutationFn: payload => queryRequest('deals/update-stage', payload, undefined, 'POST'),
    mutationKey: ['deals', 'update-stage'],
    onError: () => {
      messageApi?.error(__('Failed to update deal stage'))
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['deal', Number(payload.id)] })
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
    }
  })

  return {
    isUpdateError: isError,
    isUpdatingStage: isPending,
    updateDealStage: mutateAsync
  }
}
