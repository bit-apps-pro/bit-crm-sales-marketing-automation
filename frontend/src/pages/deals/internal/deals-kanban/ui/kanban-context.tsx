import { cn } from '@common/helpers/globalHelpers'
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor
} from '@dnd-kit/core'
import { KeyboardSensor, PointerSensor, useSensors } from '@dnd-kit/core'
import { type Deal } from '@pages/deal/shared/deal-types'
import { memo, useCallback, useMemo, useRef, useState } from 'react'

import useUpdateDealStage from '../data/use-update-deal-stage'
import { type DropPosition, type StageKey } from '../shared/types'
import {
  useDealsByStageStore,
  useDealsKanbanActionsStore,
  useStageAmountsStore,
  useStageCountsStore,
  useStagePaginationStore,
  useStagesStore
} from '../state/use-deals-kanban-store'
import { useUpdateDealStageActionsStore } from '../state/use-update-deal-stage-store'
import DealCard from './deal-card'
import KanbanColumn from './kanban-column'

interface KanbanContextProps {
  onLoadMore: (...args: [number, string]) => Promise<void> | undefined
}

const KanbanContext = ({ onLoadMore }: KanbanContextProps) => {
  const [activeId, setActiveId] = useState<string | undefined>()
  const [dropPosition, setDropPosition] = useState<DropPosition | undefined>()
  const [draggedCardHeight, setDraggedCardHeight] = useState<number | undefined>()
  const lastDropPositionRef = useRef<DropPosition | undefined>()

  const { isUpdatingStage, updateDealStage } = useUpdateDealStage()
  const { moveDealToPosition } = useDealsKanbanActionsStore()

  const dealsByStage = useDealsByStageStore()
  const stageAmounts = useStageAmountsStore()
  const stageCounts = useStageCountsStore()
  const stagePagination = useStagePaginationStore()
  const stages = useStagesStore()

  const { handleModal: handleUpdateDealStageModal } = useUpdateDealStageActionsStore()

  const getStageProbability = useCallback(
    (stage: StageKey): number => {
      const stageConfig = stages.find(s => s.key === stage)
      return stageConfig?.probability ?? 0
    },
    [stages]
  )

  const allDeals: Deal[] = useMemo(() => Object.values(dealsByStage).flat(), [dealsByStage])

  const activeDeal = useMemo(() => {
    return activeId ? allDeals.find((deal: Deal) => deal.id.toString() === activeId) : undefined
  }, [activeId, allDeals])

  const activeStage = useMemo(
    () => stages.find(stage => stage.key === activeDeal?.stage),
    [activeDeal, stages]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0
      }
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (isUpdatingStage) {
        return
      }
      const dealId = event.active.id as string
      setActiveId(dealId)

      const cardElement = document.querySelector(`[data-deal-card-id="${dealId}"]`)
      if (cardElement) {
        const height = cardElement.getBoundingClientRect().height
        setDraggedCardHeight(height)
      }
    },
    [isUpdatingStage]
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event

      if (!over || !activeId || isUpdatingStage) {
        if (lastDropPositionRef.current) {
          lastDropPositionRef.current = undefined
          setDropPosition(undefined)
        }
        return
      }

      const overId = over.id as string

      const isOverStageContainer = overId in dealsByStage

      let targetStage: StageKey
      let targetPosition: number

      if (isOverStageContainer) {
        targetStage = overId as StageKey
        targetPosition = dealsByStage[targetStage]?.length || 0
      } else {
        let foundStage: StageKey | undefined
        let foundPosition = -1

        for (const stageKey in dealsByStage) {
          const index = dealsByStage[stageKey].findIndex(deal => deal.id.toString() === overId)
          if (index !== -1) {
            foundStage = stageKey as StageKey
            foundPosition = index
            break
          }
        }

        if (!foundStage) return

        targetStage = foundStage
        targetPosition = foundPosition
      }

      if (
        !lastDropPositionRef.current ||
        lastDropPositionRef.current.stageValue !== targetStage ||
        lastDropPositionRef.current.position !== targetPosition
      ) {
        const newPosition = { position: targetPosition, stageValue: targetStage }
        lastDropPositionRef.current = newPosition
        setDropPosition(newPosition)
      }
    },
    [activeId, isUpdatingStage, dealsByStage]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      const currentDropPosition = lastDropPositionRef.current

      setActiveId(undefined)
      setDropPosition(undefined)
      setDraggedCardHeight(undefined)
      lastDropPositionRef.current = undefined

      if (!over || !currentDropPosition || isUpdatingStage) {
        return
      }

      const dealId = active.id.toString()
      const deal = allDeals.find((d: Deal) => d.id.toString() === dealId)

      if (!deal) {
        return
      }

      const { position, stageValue: newStageKey } = currentDropPosition

      if (deal.stage === newStageKey) {
        return
      }

      const oldStageKey = deal.stage as StageKey
      const oldPosition = dealsByStage[oldStageKey]?.findIndex(d => d.id.toString() === dealId) || 0

      moveDealToPosition(dealId, newStageKey, position)

      const stageProbability = getStageProbability(newStageKey)

      const newStage = stages.find(stage => stage.key === newStageKey)

      if (newStage?.deal_category === 'closed_lost' || newStage?.deal_category === 'closed_won') {
        return handleUpdateDealStageModal(true, {
          deal,
          newStage,
          oldPosition,
          oldStageKey
        })
      }

      try {
        await updateDealStage({
          id: Number(dealId),
          probability: stageProbability,
          stage: newStageKey
        })
      } catch {
        moveDealToPosition(dealId, oldStageKey, oldPosition)
      }
    },
    [
      isUpdatingStage,
      allDeals,
      dealsByStage,
      moveDealToPosition,
      getStageProbability,
      stages,
      handleUpdateDealStageModal,
      updateDealStage
    ]
  )

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className={cn('scroller thin flex h-[70vh] gap-2 overflow-x-auto pb-4')}>
        {stages.map(stage => {
          const stageDeals = dealsByStage[stage.key]
          const stagePaginationData = stagePagination[stage.key]
          const isDropTarget = dropPosition?.stageValue === stage.key
          const isCurrentStage = activeDeal && activeDeal.stage === stage.key

          return (
            <KanbanColumn
              activeDeal={activeDeal}
              currentPage={stagePaginationData?.currentPage || 1}
              dealCount={stageCounts[stage.key] || 0}
              deals={stageDeals}
              draggedCardHeight={draggedCardHeight}
              dropPosition={isDropTarget ? dropPosition.position : undefined}
              hasMore={stagePaginationData?.hasMore || false}
              isLoadingMore={stagePaginationData?.isLoading || false}
              isOver={isDropTarget && !isCurrentStage}
              key={stage.key}
              onLoadMore={onLoadMore}
              stage={stage}
              totalAmount={stageAmounts[stage.key] || 0}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} isDragOverlay stage={activeStage} />}
      </DragOverlay>
    </DndContext>
  )
}

export default memo(KanbanContext)
