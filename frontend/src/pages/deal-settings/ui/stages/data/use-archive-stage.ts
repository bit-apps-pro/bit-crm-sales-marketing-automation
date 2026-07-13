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

export default function useArchiveStage() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    string,
    MutationContext
  >({
    mutationFn: key => queryRequest('deals/stages/archive', { key }, undefined, 'POST'),
    mutationKey: ['deals', 'stages', 'archive'],
    onError: (_error, _archivedKey, context) => {
      if (context?.previousStages) {
        queryClient.setQueryData(['deals', 'stages'], context.previousStages)
      }

      messageApi?.error(__('Failed to archive stage'))
    },
    onMutate: async keyToArchive => {
      await queryClient.cancelQueries({ queryKey: ['deals', 'stages'] })

      const previousStages = queryClient.getQueryData<StagesResponse>(['deals', 'stages'])

      queryClient.setQueryData(['deals', 'stages'], (old: StagesResponse | undefined) => {
        if (!old?.data) return old

        return create(old, draft => {
          draft.data = draft.data.filter((stage: Stage) => stage.key !== keyToArchive)
        })
      })

      return { previousStages }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', 'stages'] })
    },
    onSuccess: () => {
      messageApi?.success(__('Stage archived successfully'))
    }
  })

  return {
    archiveStage: mutateAsync,
    isArchivingStage: isPending
  }
}
