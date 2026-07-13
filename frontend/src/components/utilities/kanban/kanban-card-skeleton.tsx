import { cn } from '@common/helpers/globalHelpers'
import { Divider } from 'antd'

export default function KanbanCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded border border-dashed border-gray-400 bg-white p-2 shadow-sm dark:border-slate-600 dark:bg-slate-800',
        'animate-pulse',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-start gap-2">
        <div className="h-4 w-4 rounded-sm bg-gray-300 dark:bg-slate-600" />
        <div className="h-3 w-3/4 rounded bg-gray-300 dark:bg-slate-700" />
      </div>

      <div className="mb-1 flex items-center justify-between">
        <div className="h-2 w-1/4 rounded bg-gray-300 dark:bg-slate-700" />
        <div className="h-2 w-1/6 rounded bg-gray-300 dark:bg-slate-700" />
      </div>

      <Divider className="my-2" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-slate-600" />
          <div className="h-2 w-16 rounded bg-gray-300 dark:bg-slate-700" />
        </div>
        <div className="h-3 w-12 rounded bg-gray-300 dark:bg-slate-700" />
      </div>
    </div>
  )
}
