import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

import { type Stage } from '../shared/types'

interface StagesResponse {
  data: Stage[]
}

interface MutationContext {
  previousStages: StagesResponse | undefined
}

export default function useUpdateStage() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    Stage,
    MutationContext
  >({
    mutationFn: stage => queryRequest('deals/stages/update', stage, undefined, 'POST'),
    mutationKey: ['deals', 'stages', 'update'],
    onError: (_error, _newStage, context) => {
      if (context?.previousStages) {
        queryClient.setQueryData(['deals', 'stages'], context.previousStages)
      }

      messageApi?.error(__('Failed to update stage'))
    },
    onMutate: async updatedStage => {
      await queryClient.cancelQueries({ queryKey: ['deals', 'stages'] })

      const previousStages = queryClient.getQueryData<StagesResponse>(['deals', 'stages'])

      queryClient.setQueryData(['deals', 'stages'], (old: StagesResponse | undefined) => {
        if (!old?.data) return old

        return create(old, draft => {
          const index = draft.data.findIndex((stage: Stage) => stage.key === updatedStage.key)
          if (index !== -1) {
            draft.data[index] = { ...draft.data[index], ...updatedStage }
          }
        })
      })

      return { previousStages }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', 'stages'] })
    },
    onSuccess: () => {
      messageApi?.success(__('Stage updated successfully'))
    }
  })

  return {
    isUpdatingStage: isPending,
    updateStage: mutateAsync
  }
}
