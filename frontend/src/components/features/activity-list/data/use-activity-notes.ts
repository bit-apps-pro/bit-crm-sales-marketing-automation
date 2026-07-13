import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type NoteType } from '@features/notes/shared/note-types'
import { useQuery } from '@tanstack/react-query'

export default function useActivityNotes(activityId?: number | string) {
  const { data, error, isError, isPending, refetch } = useQuery<Response<NoteType[]>, Error, NoteType[]>(
    {
      enabled: !!activityId,
      queryFn: ({ signal }) =>
        queryRequest(`activities/notes/${activityId}`, {}, { module: 'activity' }, 'GET', { signal }),
      queryKey: ['activities', 'notes', activityId],
      select: res => res.data
    }
  )

  if (isError) {
    console.error(error)
  }

  return {
    isFetchingNotes: isPending,
    notes: data,
    refetchNotes: refetch
  }
}
