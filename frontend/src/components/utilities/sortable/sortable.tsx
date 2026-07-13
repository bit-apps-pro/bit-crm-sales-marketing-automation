import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import React, { useEffect, useState } from 'react'

interface ItemOrder {
  field_key: string
  order: number
}

interface Props<T, O> {
  children: React.ReactNode
  items: T
  onSortChange: (items: T) => void
  orders?: O
}

const Sortable = ({ children, items, onSortChange, orders }: Props<FieldItem[], ItemOrder[]>) => {
  const [sortedItems, setSortedItems] = useState(items)

  useEffect(() => {
    setSortedItems(items)
  }, [items, sortedItems, orders])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSortedItems(items => {
        const oldIndex = items.findIndex(item => item.field_key === active.id)
        const newIndex = items.findIndex(item => item.field_key === over.id)
        const sortedItems = arrayMove(items, oldIndex, newIndex)
        onSortChange(sortedItems)
        return sortedItems
      })
    }
  }

  return (
    <div className="space-y-5">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={sortedItems.map(item => item.field_key)}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default Sortable
