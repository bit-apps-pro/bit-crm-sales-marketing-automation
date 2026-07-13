import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'

import { type SaveMappingPayload } from '../shared/types'

export default function useSaveMapping() {
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, SaveMappingPayload>(
    {
      mutationFn: payload => queryRequest('settings/upsert', payload),
      mutationKey: ['settings', 'upsert'],
      onError: () => {
        messageApi?.error(__('Could not save conversion mapping.'))
      },
      onSuccess: () => {
        messageApi?.success(__('Conversion mapping saved successfully'))
      }
    }
  )

  return {
    isSavingMapping: isPending,
    saveMapping: mutateAsync
  }
}
