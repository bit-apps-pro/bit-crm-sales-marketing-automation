import { type FilterCondition } from '@features/advanced-filter/shared/types'
import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'
import { type Deal } from '@pages/deal/shared/deal-types'
import { type SearchData } from '@pages/deals/shared/types'

export interface DealsKanbanProps {
  searchData: {
    advancedFilterGroups?: FilterCondition[][]
    page: number
    perPage: number
    searchTerm: string
    sortBy: string
    sortOrder: string
  }
}

export interface DropPosition {
  position: number
  stageValue: StageKey
}

export interface DealCardProps {
  deal: Deal
  isDragOverlay?: boolean
  stage?: Stage
}

export interface LoadMoreStageDealsParams {
  page: number
  perPage: number
  searchData: SearchData
  stage: StageKey
}

export interface KanbanColumnProps {
  activeDeal?: Deal
  currentPage?: number
  dealCount: number
  deals: Deal[]
  draggedCardHeight?: number
  dropPosition?: number
  hasMore?: boolean
  isLoadingMore?: boolean
  isOver?: boolean
  onLoadMore: (page: number, stage: string) => void
  stage: Stage
  totalAmount: number
}

export type StageKey = Stage['key']

export interface GroupedDeals {
  dealsByStage: Record<StageKey, Deal[]>
  stageAmounts: Record<StageKey, number>
  stageCounts: Record<StageKey, number>
}

export interface StageStatistics {
  stageAmounts: Record<StageKey, number>
  stageCounts: Record<StageKey, number>
}

export interface StagePagination {
  currentPage: number
  hasMore: boolean
  isLoading: boolean
  totalDeals: number
}

export type StagePaginationState = Record<StageKey, StagePagination>

export interface DealsKanbanStore {
  actions: {
    appendDealsToStage: (stage: StageKey, deals: Deal[], totalDeals: number) => void
    clearStore: () => void
    initializeStagePagination: (stages: StageKey[]) => void
    moveDealToPosition: (dealId: string, newStage: StageKey, position: number) => void
    setDealsData: (deals: Deal[]) => void
    setStagePagination: (stage: StageKey, pagination: StagePagination) => void
    setStages: (stages: Stage[]) => void
    setStageStatistics: (statistics: StageStatistics) => void
    setStageTotalDeals: (stage: StageKey, totalDeals: number, perPage?: number) => void
    updateDeal: (dealId: number | string, updates: Partial<Deal>) => void
  }
  dealsByStage: Record<StageKey, Deal[]>
  stageAmounts: Record<StageKey, number>
  stageCounts: Record<StageKey, number>
  stagePagination: StagePaginationState
  stages: Stage[]
}
