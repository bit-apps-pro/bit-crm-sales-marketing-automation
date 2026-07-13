import { MODULES } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { useNavigate } from 'react-router'

import { type ConvertSingleLeadPayload, type ConvertSingleLeadResponse } from '../shared/lead-types'

export default function useConvertSingleLead() {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)
  const navigate = useNavigate()

  const { isPending, mutateAsync } = useMutation<
    Response<ConvertSingleLeadResponse>,
    Response<string>,
    ConvertSingleLeadPayload
  >({
    mutationFn: payload => queryRequest('leads/convert-single', payload),
    mutationKey: ['leads', 'convert-single'],
    onError: error => {
      messageApi?.error(error.message || error.data || __('Could not convert lead'))
    },
    onSuccess: (response, payload) => {
      messageApi?.success(response.message || __('Lead converted successfully.'))
      navigate(`/contacts/details/${response?.data?.convertedContactId}`)
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      if (payload.convertTo.includes(MODULES.DEAL)) {
        queryClient.invalidateQueries({ queryKey: ['deals'] })
      }
    }
  })

  return {
    convertSingleLead: mutateAsync,
    isConvertingSingleLead: isPending
  }
}
