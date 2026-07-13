/* eslint-disable no-param-reassign */
import queryRequest from '@common/helpers/request'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { type LeadResType, type LeadType } from '../shared/lead-types'

function processDates(obj: Record<string, unknown>): LeadType {
  Object.entries(obj).forEach(([key, value]) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      'field_type' in value &&
      (value as { field_type?: string }).field_type === 'date'
    ) {
      obj[key] = (value as { field_value?: string }).field_value
        ? dayjs((value as { field_value?: string }).field_value)
        : ''
    }
  })
  return obj as LeadType
}

export default function useLead(id: string | undefined) {
  const { data, isError, isFetching, isPending, refetch }: UseQueryResult<LeadResType, Error> = useQuery<
    LeadResType,
    Error
  >({
    queryFn: ({ signal }) => queryRequest(`leads/${id}`, undefined, undefined, 'GET', { signal }),
    queryKey: ['lead', id],
    retry: false,
    select: res => {
      res.data = processDates(res.data)
      return res
    }
  })

  return {
    isLeadError: isError,
    isLeadFetching: isFetching,
    isLeadPending: isPending,
    lead: data?.data,
    refetchLead: refetch
  }
}
