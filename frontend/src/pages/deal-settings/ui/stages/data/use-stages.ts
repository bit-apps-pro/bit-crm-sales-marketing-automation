import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type Stage } from '../shared/types'

export default function useStages() {
  const { data, isError, isFetching, isLoading, refetch } = useQuery<Response<Stage[]>, Error, Stage[]>({
    queryFn: ({ signal }) => queryRequest('deals/stages', undefined, undefined, 'GET', { signal }),
    queryKey: ['deals', 'stages'],
    select: res => res.data
  })

  return {
    isStagesError: isError,
    isStagesFetching: isFetching,
    isStagesLoading: isLoading,
    refetchStages: refetch,
    stages: data || []
  }
}
