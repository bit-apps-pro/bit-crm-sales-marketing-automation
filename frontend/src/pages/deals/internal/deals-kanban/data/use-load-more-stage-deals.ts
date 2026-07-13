import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Deal } from '@pages/deal/shared/deal-types'
import { useMutation } from '@tanstack/react-query'

import { type LoadMoreStageDealsParams } from '../shared/types'
import { useDealsKanbanActionsStore, useStagePaginationStore } from '../state/use-deals-kanban-store'

interface StageDealsResponse {
  data: Deal[]
  total: number
}

export default function useLoadMoreStageDeals() {
  const { appendDealsToStage, setStagePagination } = useDealsKanbanActionsStore()
  const stagePagination = useStagePaginationStore()

  const { mutateAsync } = useMutation<
    Response<StageDealsResponse>,
    Response<string> | Response<ValidationType<Deal[]>>,
    LoadMoreStageDealsParams
  >({
    mutationFn: ({ page, perPage = 10, searchData, stage }) => {
      const stageFilter = {
        field_key: 'stage',
        field_type: 'select',
        is_custom: false,
        operator: 'equals',
        value: stage
      }
      const existingGroups = searchData.advancedFilterGroups || []
      const advancedFilterGroups =
        existingGroups.length > 0
          ? existingGroups.map(group => [...group, stageFilter])
          : [[stageFilter]]

      const payload = {
        ...searchData,
        advancedFilterGroups,
        page,
        perPage
      }
      return queryRequest('deals/search', payload, undefined, 'POST')
    },
    onError: (_, payload) => {
      const { stage } = payload ?? {}
      const currentPagination = stagePagination[stage]
      return setStagePagination(stage, {
        ...currentPagination,
        isLoading: false
      })
    },
    onSuccess: (response, payload) => {
      const { stage } = payload ?? {}
      const deals = response.data?.data
      const totalDeals = response.data?.total
      const currentPagination = stagePagination[stage]

      if (!deals || deals.length === 0) {
        return setStagePagination(stage, {
          ...currentPagination,
          hasMore: false,
          isLoading: false
        })
      }
      return appendDealsToStage(stage, deals, totalDeals)
    }
  })

  return {
    loadMoreStageDeals: mutateAsync
  }
}
