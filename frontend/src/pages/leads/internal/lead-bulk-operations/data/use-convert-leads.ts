import { MODULES } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type ConvertLeadsPayload } from '@pages/leads/shared/leads-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useConvertLeads() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string>,
    ConvertLeadsPayload
  >({
    mutationFn: payload => queryRequest('leads/convert', payload),
    mutationKey: ['leads', 'convert'],
    onError: error => {
      messageApi?.error(error.message || error.data || __('Could not convert leads'))
    },
    onSuccess: (response, payload) => {
      messageApi?.success(response.data || __('Leads converted successfully'))
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      if (payload.convertTo.includes(MODULES.DEAL)) {
        queryClient.invalidateQueries({ queryKey: ['deals'] })
      }
    }
  })

  return {
    convertLeads: mutateAsync,
    isConvertingLeads: isPending
  }
}
