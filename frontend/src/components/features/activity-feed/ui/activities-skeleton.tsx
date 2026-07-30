import { Skeleton } from 'antd'

export default function ActivitiesSkeleton() {
  return (
    <div className="h-full space-y-4 border-0 border-r border-solid border-[#EBEAFF] pr-7 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <Skeleton.Avatar active shape="square" size="small" />
        <Skeleton.Input active className="w-24" size="small" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            className="rounded-[16px] border border-solid border-[#EBEAFF] bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
            key={i}
          >
            <div className="flex items-center justify-between">
              <Skeleton.Input active className="w-40" size="small" />
              <Skeleton.Button active className="rounded-full" size="small" style={{ width: 60 }} />
            </div>
            <Skeleton active className="mt-2" paragraph={{ rows: 2 }} title={false} />
            <div className="mt-4 flex items-center justify-between border-0 border-t border-dashed border-[#EBEAFF] pt-4 dark:border-neutral-700">
              <div className="flex items-center gap-1">
                <Skeleton.Avatar active shape="square" size="small" />
                <Skeleton.Input active className="w-20" size="small" />
              </div>
              <div className="flex gap-3">
                <Skeleton.Avatar active shape="square" size="small" />
                <Skeleton.Avatar active shape="square" size="small" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
