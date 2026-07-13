import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { create } from 'mutative'
import { useContext } from 'react'

import { type Stage } from '../shared/types'

interface StagesResponse {
  data: Stage[]
}

interface MutationContext {
  previousStages: StagesResponse | undefined
}

export default function useSaveStage(form: FormInstance) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string> | Response<ValidationType<Stage>>,
    Stage,
    MutationContext
  >({
    mutationFn: stage => queryRequest('deals/stages/store', stage, undefined, 'POST'),
    mutationKey: ['deals', 'stages', 'store'],
    onError: (error, _newStage, context) => {
      if (context?.previousStages) {
        queryClient.setQueryData(['deals', 'stages'], context.previousStages)
      }

      if (error.data instanceof Object) {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
        return
      }

      messageApi?.error(error.message || __('Failed to create stage'))
    },
    onMutate: async newStage => {
      await queryClient.cancelQueries({ queryKey: ['deals', 'stages'] })
      const previousStages = queryClient.getQueryData<StagesResponse>(['deals', 'stages'])

      queryClient.setQueryData(['deals', 'stages'], (old: StagesResponse | undefined) => {
        if (!old?.data) return old

        return create(old, draft => {
          draft.data.push(newStage)
        })
      })

      return { previousStages }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', 'stages'] })
    },
    onSuccess: () => {
      messageApi?.success(__('Stage created successfully'))
    }
  })

  return {
    isSavingStage: isPending,
    saveStage: mutateAsync
  }
}
