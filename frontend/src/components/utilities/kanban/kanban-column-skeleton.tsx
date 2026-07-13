import { Skeleton } from 'antd'

import KanbanCardSkeleton from './kanban-card-skeleton'

const COLUMNS = [3, 5, 2, 4, 1, 2]

export default function KanbanColumnSkeleton() {
  return (
    <div className="flex h-[70vh] w-full gap-2 overflow-hidden">
      {COLUMNS.map((rowCount, colIndex) => (
        <div
          className="flex min-w-80 flex-col gap-3 rounded-md border-t-4 bg-gray-50 p-3 dark:bg-slate-900"
          key={colIndex}
        >
          <Skeleton.Node active className="h-12 w-full" />
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <KanbanCardSkeleton key={rowIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}
