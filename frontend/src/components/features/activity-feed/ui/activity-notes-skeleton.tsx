import { Skeleton } from 'antd'

export default function ActivityNotesSkeleton() {
  return (
    <div className="h-full space-y-5 border-0 border-l border-solid border-[#EBEAFF] pl-7 dark:border-neutral-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton.Avatar active shape="square" size="small" />
            <Skeleton.Input active className="w-24" size="small" />
          </div>
          <Skeleton.Button active className="rounded-full" size="small" style={{ width: 90 }} />
        </div>
        <div className="space-y-2 pr-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              className="rounded border border-solid border-[#E5E3FE] p-3 dark:border-neutral-700"
              key={i}
            >
              <div className="flex items-start gap-0.5">
                <Skeleton active className="flex-1" paragraph={{ rows: 2 }} title={false} />
                <Skeleton.Avatar active shape="square" size="small" />
              </div>
              <Skeleton.Input active className="mt-2 w-28" size="small" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
