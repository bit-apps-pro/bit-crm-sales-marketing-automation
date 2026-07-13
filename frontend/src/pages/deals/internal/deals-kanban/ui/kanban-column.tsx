import { cn } from '@common/helpers/globalHelpers'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from '@utilities/kanban/sortable-item'
import React, { memo, useMemo } from 'react'

import { type KanbanColumnProps } from '../shared/types'
import DealCard from './deal-card'
import KanbanColumnFooter from './kanban-column-footer'
import KanbanColumnHeader from './kanban-column-header'

function KanbanColumn({
  currentPage = 1,
  dealCount = 0,
  deals = [],
  draggedCardHeight = 120,
  dropPosition,
  hasMore = false,
  isLoadingMore = false,
  isOver,
  onLoadMore,
  stage,
  totalAmount
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.key })

  const dealIds = useMemo(() => deals.map(deal => deal.id), [deals])

  const sortableItems = useMemo(() => deals.map(deal => deal.id.toString()), [deals])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || isLoadingMore) return

    const { clientHeight, dataset, scrollHeight, scrollTop } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 5 && typeof dataset.scroll === 'string') {
      onLoadMore(currentPage + 1, dataset.scroll)
    }
  }

  return (
    <div className="group/column relative flex min-w-80 flex-col overflow-hidden rounded-md border border-solid border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-slate-900">
      <KanbanColumnHeader amount={totalAmount} count={dealCount} ids={dealIds} stage={stage} />

      <div
        className={cn(
          'scroller thin flex-1 overflow-y-auto px-2 pb-2 transition-all duration-200',
          isOver && 'bg-blue-50/30 ring-2 ring-inset ring-blue-200/50 dark:bg-blue-900/10'
        )}
        data-scroll={stage.key}
        onScroll={handleScroll}
      >
        <div ref={setNodeRef}>
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            <div className="mb-10 space-y-2 transition-all duration-300 ease-out">
              {deals.map((deal, index) => {
                const showPlaceholderBefore = isOver && dropPosition === index

                return (
                  <React.Fragment key={deal.id}>
                    {showPlaceholderBefore && (
                      <div
                        className="rounded-md border-2 border-dashed border-blue-300 bg-blue-50/30 dark:border-blue-600 dark:bg-blue-900/10"
                        style={{ height: draggedCardHeight }}
                      />
                    )}
                    <SortableItem id={deal.id.toString()}>
                      <div data-deal-card-id={deal.id}>
                        <DealCard deal={deal} stage={stage} />
                      </div>
                    </SortableItem>
                  </React.Fragment>
                )
              })}
              {isOver && dropPosition !== undefined && dropPosition >= deals.length && (
                <div
                  className="rounded-md border-2 border-dashed border-blue-300 bg-blue-50/30 dark:border-blue-600 dark:bg-blue-900/10"
                  style={{ height: draggedCardHeight }}
                />
              )}
            </div>
          </SortableContext>
        </div>
      </div>

      <KanbanColumnFooter stageKey={stage.key} />
    </div>
  )
}

export default memo(KanbanColumn)
