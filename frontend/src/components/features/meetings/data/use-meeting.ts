import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'
import { type Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import { type MeetingType } from '../shared/meeting-types'
import useMeetingStore from '../state/use-meeting-store'

type TransformedMeetingType = Omit<MeetingType, 'due_date'> & { due_date?: Dayjs }

export default function useMeeting(id: number) {
  const { isEditModalOpen } = useMeetingStore()
  const { data, error, isError, isFetching } = useQuery<
    Response<MeetingType>,
    Error,
    TransformedMeetingType
  >({
    enabled: isEditModalOpen,
    queryFn: ({ signal }) =>
      queryRequest<MeetingType>(`activities/${id}`, {}, undefined, 'GET', { signal }),
    queryKey: ['activities', 'meetings', id],
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
    isFetchingMeeting: isFetching,
    meeting: data
  }
}
