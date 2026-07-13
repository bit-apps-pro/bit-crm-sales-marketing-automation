/* eslint-disable no-param-reassign */
import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { type Deal } from '../shared/deal-types'

function processData(obj: Deal): Deal {
  Object.entries(obj).forEach(([key, value]) => {
    if (
      value instanceof Object &&
      'field_type' in value &&
      (value as { field_type?: string }).field_type === 'date'
    ) {
      obj[key] = (value as { field_value?: string }).field_value
        ? dayjs((value as { field_value?: string }).field_value)
        : ''
    }
  })
  return obj
}

export default function useDeal(dealId: number | string) {
  const { data, isError, isFetching, isPending, refetch } = useQuery<Response<Deal>, Error, Deal>({
    enabled: dealId !== 0 && Boolean(dealId) && checkCapability(CAPABILITIES.DEAL.VIEW),
    queryFn: ({ signal }) => queryRequest(`deals/${dealId}`, undefined, undefined, 'GET', { signal }),
    queryKey: ['deal', Number(dealId)],
    select: res => {
      res.data = processData(res.data)
      return res.data
    }
  })

  return {
    deal: data,
    isDealError: isError,
    isDealFetching: isFetching,
    isDealPending: isPending,
    refetchDeal: refetch
  }
}
