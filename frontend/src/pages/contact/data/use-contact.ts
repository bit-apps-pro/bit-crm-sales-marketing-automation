/* eslint-disable no-param-reassign */
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { type ContactType } from '../shared/contact-types'

export interface ContactResType {
  data: ContactType
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processDates(obj: Record<string, any>): ContactType {
  Object.entries(obj).forEach(([key, value]) => {
    if (value?.field_type === 'date') {
      obj[key] = value.field_value ? dayjs(value.field_value) : ''
    } else if (key === 'date_of_birth' && value) {
      obj[key] = dayjs(value)
    }
  })
  return obj as ContactType
}

export default function useContact(id: string | undefined) {
  const { data, isError, isFetching, isPending, refetch } = useQuery<ContactResType>({
    queryFn: ({ signal }) => queryRequest(`contacts/${id}`, undefined, undefined, 'GET', { signal }),
    queryKey: ['contact', id],
    retry: false,
    select: res => {
      res.data = processDates(res.data)
      return res
    }
  })

  return {
    contact: data?.data,
    isContactError: isError,
    isContactFetching: isFetching,
    isContactPending: isPending,
    refetchContact: refetch
  }
}
