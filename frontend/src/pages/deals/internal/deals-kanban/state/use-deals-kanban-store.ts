import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'
import { type Deal } from '@pages/deal/shared/deal-types'
import { create } from 'zustand'

import {
  createPaginationForStage,
  getStageProbability,
  groupDealsAndCalculateAmounts
} from '../shared/helpers'
import {
  type DealsKanbanStore,
  type StageKey,
  type StagePagination,
  type StageStatistics
} from '../shared/types'

const useDealsKanbanStore = create<DealsKanbanStore>((set, get) => {
  return {
    dealsByStage: {},
    stageAmounts: {},
    stageCounts: {},
    stagePagination: {},
    stages: [],

    actions: {
      setDealsData: (deals: Deal[]) => {
        const { dealsByStage: currentDealsByStage, stages } = get()
        const { dealsByStage: newDealsByStage } = groupDealsAndCalculateAmounts(deals, stages)
        const mergedDealsByStage = {} as Record<StageKey, Deal[]>

        if (stages && stages.length > 0) {
          for (const stage of stages) {
            const currentDeals = currentDealsByStage[stage.key] || []
            const newDeals = newDealsByStage[stage.key] || []

            if (currentDeals.length === 0) {
              mergedDealsByStage[stage.key] = newDeals
              continue
            }

            const newDealsById: Record<string, Deal> = {}
            for (const deal of newDeals) {
              newDealsById[deal.id.toString()] = deal
            }

            const updatedDeals: Deal[] = []
            const remainingNewDeals: Deal[] = []
            const processedIds = new Set<string>()

            for (const deal of currentDeals) {
              const dealIdStr = deal.id.toString()
              const updated = newDealsById[dealIdStr]
              if (updated) {
                updatedDeals.push(updated)
                processedIds.add(dealIdStr)
              }
            }

            for (const dealIdStr in newDealsById) {
              if (!processedIds.has(dealIdStr)) {
                remainingNewDeals.push(newDealsById[dealIdStr])
              }
            }

            mergedDealsByStage[stage.key] = [...updatedDeals, ...remainingNewDeals]
          }
        }

        // Recalculate amounts from the merged deals to ensure consistency
        const recalculatedAmounts = {} as Record<StageKey, number>
        for (const stageKey in mergedDealsByStage) {
          recalculatedAmounts[stageKey] = mergedDealsByStage[stageKey].reduce((sum, deal) => {
            return sum + (Number(deal.home_currency_amount || deal.amount) || 0)
          }, 0)
        }

        set({
          dealsByStage: mergedDealsByStage,
          stageAmounts: recalculatedAmounts
        })
      },

      setStageTotalDeals: (stage: StageKey, totalDeals: number) => {
        set(state => {
          const currentStageDeals = state.dealsByStage[stage] || []
          const totalLoaded = currentStageDeals.length
          const hasMore = totalLoaded < totalDeals

          const currentPagination = state.stagePagination[stage] || createPaginationForStage()

          return {
            stagePagination: {
              ...state.stagePagination,
              [stage]: {
                ...currentPagination,
                hasMore,
                totalDeals
              }
            }
          }
        })
      },

      setStagePagination: (stage: StageKey, pagination: StagePagination) => {
        set(state => ({
          stagePagination: {
            ...state.stagePagination,
            [stage]: pagination
          }
        }))
      },

      appendDealsToStage: (stage: StageKey, deals: Deal[], totalDeals: number) => {
        set(state => {
          const currentStageDeals = state.dealsByStage[stage] || []
          const newDeals = [...currentStageDeals, ...deals]

          const currentPagination = state.stagePagination[stage] || createPaginationForStage()
          const currentPage = currentPagination.currentPage || 1
          const nextPage = currentPage + 1
          const totalLoaded = newDeals.length
          const hasMore = totalLoaded < totalDeals

          return {
            dealsByStage: {
              ...state.dealsByStage,
              [stage]: newDeals
            },
            stagePagination: {
              ...state.stagePagination,
              [stage]: {
                currentPage: nextPage,
                hasMore,
                isLoading: false,
                totalDeals
              }
            }
          }
        })
      },

      setStageStatistics: (statistics: StageStatistics) => {
        set(state => ({
          // Only update amounts if provided (not empty/undefined)
          stageAmounts:
            statistics.stageAmounts && Object.keys(statistics.stageAmounts).length > 0
              ? statistics.stageAmounts
              : state.stageAmounts,
          stageCounts: statistics.stageCounts
        }))
      },

      setStages: (stages: Stage[]) => {
        set({
          stages
        })
      },

      initializeStagePagination: (stages: StageKey[]) => {
        set(state => {
          const newPagination = { ...state.stagePagination }

          for (const stage of stages) {
            if (!newPagination[stage]) {
              newPagination[stage] = createPaginationForStage()
            }
          }

          return { stagePagination: newPagination }
        })
      },

      moveDealToPosition: (dealId: string, newStage: StageKey, position: number) => {
        const { dealsByStage, stageAmounts, stageCounts, stages } = get()

        let dealToMove: Deal | undefined
        let oldStage: StageKey | undefined

        if (stages && stages.length > 0) {
          for (const stage of stages) {
            const foundDeal = dealsByStage[stage.key].find(deal => deal.id.toString() === dealId)
            if (foundDeal) {
              dealToMove = foundDeal
              oldStage = stage.key
              break
            }
          }
        }

        if (!dealToMove || !oldStage) {
          return
        }

        const stageProbability = getStageProbability(newStage, stages)
        const updatedDeal = { ...dealToMove, probability: String(stageProbability), stage: newStage }
        // Use home_currency_amount for stage total calculations
        const dealAmount = Number(dealToMove.home_currency_amount || dealToMove.amount) || 0

        const oldStageDeals = dealsByStage[oldStage].filter(deal => deal.id.toString() !== dealId)

        const newStageDeals = [...dealsByStage[newStage]]
        const insertPosition = Math.min(Math.max(0, position), newStageDeals.length)
        newStageDeals.splice(insertPosition, 0, updatedDeal)

        set({
          dealsByStage: {
            ...dealsByStage,
            [newStage]: newStageDeals,
            [oldStage]: oldStageDeals
          },
          stageAmounts: {
            ...stageAmounts,
            [newStage]: stageAmounts[newStage] + dealAmount,
            [oldStage]: Math.max(0, stageAmounts[oldStage] - dealAmount)
          },
          stageCounts: {
            ...stageCounts,
            [newStage]: stageCounts[newStage] + 1,
            [oldStage]: Math.max(0, stageCounts[oldStage] - 1)
          }
        })
      },

      clearStore: () => {
        set({
          dealsByStage: {},
          stageAmounts: {},
          stageCounts: {},
          stagePagination: {}
        })
      },

      updateDeal: (dealId: number | string, updates: Partial<Deal>) => {
        const { dealsByStage, stageAmounts, stages } = get()
        const dealIdStr = dealId.toString()

        for (const stage of stages) {
          const dealIndex = dealsByStage[stage.key]?.findIndex(d => d.id.toString() === dealIdStr)

          if (dealIndex !== -1) {
            const currentDeal = dealsByStage[stage.key][dealIndex]
            // Use home_currency_amount for stage total calculations
            const oldAmount = Number(currentDeal.home_currency_amount || currentDeal.amount) || 0
            const newAmount = Number((updates.home_currency_amount || updates.amount) ?? oldAmount)
            const amountDiff = newAmount - oldAmount

            const updatedDeals = [...dealsByStage[stage.key]]
            updatedDeals[dealIndex] = { ...currentDeal, ...updates }

            set({
              dealsByStage: {
                ...dealsByStage,
                [stage.key]: updatedDeals
              },
              stageAmounts: {
                ...stageAmounts,
                [stage.key]: stageAmounts[stage.key] + amountDiff
              }
            })
            break
          }
        }
      }
    }
  }
})

export const useDealsByStageStore = () => useDealsKanbanStore(state => state.dealsByStage)
export const useStageAmountsStore = () => useDealsKanbanStore(state => state.stageAmounts)
export const useStageCountsStore = () => useDealsKanbanStore(state => state.stageCounts)
export const useStagePaginationStore = () => useDealsKanbanStore(state => state.stagePagination)
export const useStagesStore = () => useDealsKanbanStore(state => state.stages)

export const useDealsKanbanActionsStore = () => useDealsKanbanStore(state => state.actions)
