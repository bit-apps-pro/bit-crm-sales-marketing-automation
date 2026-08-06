import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type Stage } from '../../stages/shared/types'

export default function useArchivedStages() {
  const { data, isError, isFetching, isLoading, refetch } = useQuery<Response<Stage[]>, Error, Stage[]>({
    queryFn: ({ signal }) =>
      queryRequest('deals/stages/archived', undefined, undefined, 'GET', { signal }),
    queryKey: ['deals', 'stages', 'archived'],
    select: res => res.data
  })

  return {
    archivedStages: data || [],
    isArchivedStagesError: isError,
    isArchivedStagesFetching: isFetching,
    isArchivedStagesLoading: isLoading,
    refetchArchivedStages: refetch
  }
}
