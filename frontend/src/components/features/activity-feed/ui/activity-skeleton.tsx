import { Divider, Skeleton } from 'antd'

export default function ActivitySkeleton() {
  return (
    <div className="col-span-2 space-y-7">
      <div className="flex items-center justify-between gap-2">
        <div className="flex w-full items-center justify-between gap-2">
          <Skeleton.Input active className="w-full" size="default" />
          <Skeleton.Button active className="rounded-full" size="small" style={{ width: 80 }} />
        </div>
        <Skeleton.Button active size="small" style={{ width: 5 }} />
      </div>
      <div>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      </div>
      <Divider />
      <div className="rounded-lg border border-solid border-[#E5E3FE] p-4 dark:border-neutral-700">
        <div>
          {Array.from({ length: 3 }).map((_, row) => (
            <div
              className="grid grid-cols-2 border-0 border-b border-solid border-[#E5E3FE] p-2 last:border-b-0 dark:border-neutral-700"
              key={row}
            >
              <div className="flex items-center gap-2">
                <Skeleton.Avatar active shape="square" size="small" />
                <Skeleton.Input active size="small" style={{ width: 100 }} />
              </div>
              <div>
                <Skeleton.Input active size="small" style={{ width: 120 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div>
        <div className="flex items-center gap-1">
          <Skeleton.Avatar active shape="square" size="small" />
          <Skeleton.Input active size="small" style={{ width: 140 }} />
        </div>
        <div className="mb-5 mt-2">
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map(i => (
              <Skeleton.Image active className="h-20 w-full" key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
