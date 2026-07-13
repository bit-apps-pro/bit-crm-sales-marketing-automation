import NotifyContext from '@common/context/NotifyContext'
import queryRequest, { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

interface UpsertPrefixData {
  setting_key: string
  setting_value: {
    prefix: string
  }
}

export default function useUpsertPrefix() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)
  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, UpsertPrefixData>({
    mutationFn: data => queryRequest('settings/upsert', data, undefined, 'POST'),
    mutationKey: ['settings', 'upsert'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: () => {
      messageApi?.success('Invoice prefix updated successfully')
      queryClient.invalidateQueries({ queryKey: ['invoices', 'prefix'] })
    }
  })
  return {
    isUpdatePending: isPending,
    upsertPrefix: mutateAsync
  }
}
