import NotifyContext from '@common/context/NotifyContext'
import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useContext } from 'react'

export default function useSampleDataPrompt() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()
  const [{ sampleDataStatus }, setAppConfig] = useAtom($appConfig)

  const seed = useMutation<Response<null>, Response<string>>({
    mutationFn: () => queryRequest('sample-data/seed'),
    onError: error => messageApi?.error(error.message || __('Failed to add sample data.')),
    onSuccess: data => {
      messageApi?.success(data.message || __('Sample data added successfully.'))
      setAppConfig(prev => ({ ...prev, sampleDataStatus: 'seeded' }))
      queryClient.invalidateQueries()
    }
  })

  const dismiss = useMutation<Response<null>, Response<string>>({
    mutationFn: () => queryRequest('sample-data/dismiss'),
    onSettled: () => setAppConfig(prev => ({ ...prev, sampleDataStatus: 'dismissed' }))
  })

  return {
    dismiss: dismiss.mutateAsync,
    isDismissing: dismiss.isPending,
    isOpen: sampleDataStatus === 'pending',
    isSeeding: seed.isPending,
    seed: seed.mutateAsync
  }
}
