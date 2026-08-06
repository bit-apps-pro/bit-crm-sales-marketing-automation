import { Skeleton } from 'antd'

interface ProgressRowsSkeletonProps {
  rows?: number
}

export default function ProgressRowsSkeleton({ rows = 4 }: ProgressRowsSkeletonProps) {
  return (
    <div className="mt-2 flex flex-col gap-3.5">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="flex items-center gap-2" key={index}>
          <Skeleton.Input active block className="!h-6 flex-1" size="small" />
          <Skeleton.Input active size="small" />
        </div>
      ))}
    </div>
  )
}
