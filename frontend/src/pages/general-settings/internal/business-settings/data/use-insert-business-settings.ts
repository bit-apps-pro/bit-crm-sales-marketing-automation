import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest, { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import { type BusinessSettings } from '../shared/types'

export default function useInsertBusinessSettings() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)
  const { isPending, mutateAsync } = useMutation<Response<BusinessSettings>, Error, BusinessSettings>({
    mutationFn: data => queryRequest('settings/business/insert', data),
    mutationKey: ['settings', 'business', 'insert'],
    onError: error => {
      messageApi?.error(error.message)
    },
    onSuccess: () => {
      messageApi?.success(__('Business settings inserted successfully'))
      queryClient.invalidateQueries({ queryKey: ['settings', 'business', 'show'] })
    }
  })
  return {
    businessSettingsInserting: isPending,
    insertBusinessSettings: mutateAsync
  }
}
