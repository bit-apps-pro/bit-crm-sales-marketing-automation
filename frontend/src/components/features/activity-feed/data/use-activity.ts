import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Activity } from '@features/tasks/shared/types'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export default function useActivity(id: number) {
  const { data, isError, isLoading, isPlaceholderData } = useQuery<Response<Activity>, Error, Activity>({
    enabled: Boolean(id),
    // Keep the previous record on screen while the next one loads so moving
    // through the list does not flash a skeleton on every click.
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => queryRequest(`activities/${id}`, {}, undefined, 'GET', { signal }),
    queryKey: ['activities', id],
    // A missing record answers 400 every time; retrying only delays the
    // fallback to another selection.
    retry: false,
    select: res => res.data
  })

  return {
    // Placeholder data would otherwise keep showing the previous record after
    // the selection is cleared.
    activity: id ? data : undefined,
    isError,
    isLoading,
    isPlaceholderData: id ? isPlaceholderData : false
  }
}
