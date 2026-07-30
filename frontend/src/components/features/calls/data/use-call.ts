import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'
import dayjs, { type Dayjs } from 'dayjs'

import { type CallType } from '../shared/call-types'
import useCallStore from '../state/use-call-store'

type TransformedCallType = Omit<CallType, 'due_date'> & { due_date?: Dayjs }

export default function useCall(id: number) {
  const { isEditModalOpen } = useCallStore()
  const { data, error, isError, isFetching } = useQuery<Response<CallType>, Error, TransformedCallType>({
    enabled: isEditModalOpen,
    queryFn: ({ signal }) => queryRequest(`activities/${id}`, {}, undefined, 'GET', { signal }),
    queryKey: ['activities', 'calls', id],
    select: res => {
      return {
        ...res.data,
        due_date: res.data.due_date ? dayjs(res.data.due_date) : undefined
      }
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    call: data,
    isFetchingCall: isFetching
  }
}
