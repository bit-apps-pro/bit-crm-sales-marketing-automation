import { Skeleton } from 'antd'

export default function ActivityListSkeleton({ quantity = 4 }: { quantity?: number }) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2">
      {Array.from({ length: quantity }).map((_, index) => (
        <div className="rounded border border-solid border-[#E5E3FE] dark:border-gray-700" key={index}>
          <div className="flex items-center justify-between border-0 border-b border-solid border-[#E5E3FE] px-4 py-3 dark:border-gray-700">
            <Skeleton.Input active className="w-full" size="small" />
          </div>
          <div className="space-y-5 p-4">
            <Skeleton active paragraph={{ rows: 2 }} title={false} />
            <div className="grid grid-cols-3 rounded border border-solid border-[#E5E3FE] dark:border-gray-700">
              <div className="p-2">
                <Skeleton.Button active block size="small" />
              </div>
              <div className="border-0 border-x border-solid border-[#E5E3FE] p-2 dark:border-gray-700">
                <Skeleton.Button active block size="small" />
              </div>
              <div className="p-2">
                <Skeleton.Button active block size="small" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
