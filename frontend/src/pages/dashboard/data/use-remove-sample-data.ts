import NotifyContext from '@common/context/NotifyContext'
import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useContext } from 'react'

export default function useRemoveSampleData() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()
  const setAppConfig = useSetAtom($appConfig)

  const { isPending, mutateAsync } = useMutation<Response<null>, Response<string>>({
    mutationFn: () => queryRequest('sample-data/remove'),
    mutationKey: ['sample-data', 'remove'],
    onError: error => {
      messageApi?.error(error.message || __('Failed to remove sample data.'))
    },
    onSuccess: data => {
      messageApi?.success(data.message || __('Sample data removed successfully.'))
      setAppConfig(prev => ({ ...prev, sampleDataStatus: 'removed' }))
      queryClient.invalidateQueries()
    }
  })

  return {
    isRemovingSampleData: isPending,
    removeSampleData: mutateAsync
  }
}
