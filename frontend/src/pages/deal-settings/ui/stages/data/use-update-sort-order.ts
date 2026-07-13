import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { type Stage } from '../shared/types'

export default function useUpdateSortOrder() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, Stage[]>({
    mutationFn: stages => queryRequest('deals/stages/update-sort-order', { stages }, undefined, 'POST'),
    mutationKey: ['deals', 'stages', 'update-sort-order'],
    onError: () => {
      messageApi?.error(__('Failed to update sort order'))
    },
    onSuccess: () => {
      messageApi?.success(__('Sort order updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['deals', 'stages'] })
    }
  })

  return {
    isUpdatingSort: isPending,
    updateSortOrder: mutateAsync
  }
}
