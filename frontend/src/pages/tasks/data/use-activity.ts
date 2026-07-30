import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Activity } from '@features/tasks/shared/types'
import { useQuery } from '@tanstack/react-query'

export default function useActivity(id: number) {
  const { data, isLoading } = useQuery<Response<Activity>, Error, Activity>({
    enabled: Boolean(id),
    queryFn: ({ signal }) => queryRequest(`activities/${id}`, {}, undefined, 'GET', { signal }),
    queryKey: ['activities', id],
    select: res => res.data
  })
  return {
    activity: data,
    isLoading: isLoading
  }
}
