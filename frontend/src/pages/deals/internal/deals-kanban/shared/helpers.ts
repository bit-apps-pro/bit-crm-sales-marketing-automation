import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'
import { type Deal } from '@pages/deal/shared/deal-types'

import { type GroupedDeals, type StageKey, type StagePagination } from './types'

export const getStageProbability = (stageKey: StageKey, stages: Stage[]): number => {
  const stage = stages.find(s => s.key === stageKey)
  return stage?.probability ?? 0
}

export const createPaginationForStage = (): StagePagination => ({
  currentPage: 1,
  hasMore: true,
  isLoading: false,
  totalDeals: 0
})

export const groupDealsAndCalculateAmounts = (deals: Deal[], stages: Stage[]): GroupedDeals => {
  const dealsByStage = {} as Record<StageKey, Deal[]>
  const stageAmounts = {} as Record<StageKey, number>
  const stageCounts = {} as Record<StageKey, number>

  if (stages && stages.length > 0) {
    for (const stage of stages) {
      dealsByStage[stage.key] = []
      stageAmounts[stage.key] = 0
      stageCounts[stage.key] = 0
    }
  }

  for (const deal of deals) {
    const stage = deal.stage as StageKey
    if (stage && dealsByStage[stage]) {
      dealsByStage[stage].push(deal)
      stageAmounts[stage] += Number(deal.amount) || 0
      stageCounts[stage]++
    }
  }

  return { dealsByStage, stageAmounts, stageCounts }
}
