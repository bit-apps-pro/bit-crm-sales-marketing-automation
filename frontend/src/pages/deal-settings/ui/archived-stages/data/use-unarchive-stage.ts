import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { type Key } from 'react'
import { useContext } from 'react'

import { type Stage } from '../../stages/shared/types'

interface StagesResponse {
  data: Stage[]
}

interface MutationContext {
  previousStages: StagesResponse | undefined
}

export default function useUnarchiveStage() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    Key[],
    MutationContext
  >({
    mutationFn: keys => queryRequest('deals/stages/unarchive', { keys }, undefined, 'POST'),
    mutationKey: ['deals', 'stages', 'unarchive'],
    onError: (_error, _unarchivedKey, context) => {
      if (context?.previousStages) {
        queryClient.setQueryData(['deals', 'stages', 'archived'], context.previousStages)
      }

      messageApi?.error(__('Failed to unarchive stage'))
    },
    onMutate: async keyToUnarchive => {
      await queryClient.cancelQueries({ queryKey: ['deals', 'stages', 'archived'] })

      const previousStages = queryClient.getQueryData<StagesResponse>(['deals', 'stages', 'archived'])

      queryClient.setQueryData(['deals', 'stages', 'archived'], (old: StagesResponse | undefined) => {
        if (!old?.data) return old

        return create(old, draft => {
          draft.data = draft.data.filter((stage: Stage) => !keyToUnarchive.includes(stage.key))
        })
      })

      return { previousStages }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', 'stages'] })
    },
    onSuccess: response => {
      messageApi?.success(response.message || __('Stage unarchived successfully'))
    }
  })

  return {
    isUnarchivingStage: isPending,
    unarchiveStage: mutateAsync
  }
}
