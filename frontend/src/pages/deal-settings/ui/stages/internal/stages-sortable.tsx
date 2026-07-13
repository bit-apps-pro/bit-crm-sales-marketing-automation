import { type DragEndEvent } from '@dnd-kit/core'
import { DndContext } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'

interface StageSortableProps {
  children: React.ReactNode
  dataSource: { key: string }[]
  onDragEnd: (event: DragEndEvent) => void
}

export default function StagesSortable({ children, dataSource, onDragEnd }: StageSortableProps) {
  const items = useMemo(() => dataSource.map(i => i.key), [dataSource])

  return (
    <DndContext modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}
