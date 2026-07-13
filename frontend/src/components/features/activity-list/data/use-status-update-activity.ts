import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type ActivityType } from '@features/activity-list/shared/activity-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useStatusUpdateActivity() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  interface StatusUpdateType {
    id: number
  }

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<ActivityType>,
    Response<string>,
    StatusUpdateType
  >({
    mutationFn: data => queryRequest('activities/update-status', data),
    mutationKey: ['activities', 'update', 'status'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      messageApi?.success(data.message || __('Status updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingStatus: isPending,
    updateStatus: mutateAsync
  }
}
