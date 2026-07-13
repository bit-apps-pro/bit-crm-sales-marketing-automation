import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useDealsKanbanActionsStore } from '../state/use-deals-kanban-store'

export default function useDealStages() {
  const { setStages } = useDealsKanbanActionsStore()
  const { data, isFetching, isPending } = useQuery<Response<Stage[]>, Error, Response<Stage[]>>({
    queryFn: ({ signal }) => queryRequest('deals/stages', undefined, undefined, 'GET', { signal }),
    queryKey: ['deal-stages']
  })

  useEffect(() => {
    if (data?.data.length) setStages(data?.data)
  }, [data?.data, setStages])

  return {
    isStagesFetching: isFetching,
    isStagesPending: isPending,
    stages: data?.data || []
  }
}
