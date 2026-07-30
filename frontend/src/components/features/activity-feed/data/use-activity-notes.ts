import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type NoteType } from '@features/notes/shared/note-types'
import { useQuery } from '@tanstack/react-query'

import { type ActivityTypeValue } from '../shared/activity-types'

export default function useActivityNotes(
  submoduleType: ActivityTypeValue,
  activityId?: number | string
) {
  const { data, error, isError, isLoading, refetch } = useQuery<Response<NoteType[]>, Error, NoteType[]>(
    {
      enabled: Boolean(activityId),
      queryFn: ({ signal }) =>
        queryRequest(
          `activities/notes/${activityId}`,
          {},
          { module: 'activity', submoduleType },
          'GET',
          {
            signal
          }
        ),
      queryKey: ['activities', 'notes', activityId, submoduleType],
      select: res => res.data
    }
  )

  if (isError) {
    console.error(error)
  }

  return {
    isLoadingActivityNotes: isLoading,
    notes: data,
    refetchNotes: refetch,
    total: data?.length ?? 0
  }
}
