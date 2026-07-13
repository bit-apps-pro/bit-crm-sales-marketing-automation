import { Skeleton } from 'antd'

interface ProgressRowsSkeletonProps {
  rows?: number
}

export default function ProgressRowsSkeleton({ rows = 4 }: ProgressRowsSkeletonProps) {
  return (
    <div className="mt-2 flex flex-col gap-3.5">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="grid grid-cols-6 items-center gap-2" key={index}>
          <Skeleton.Input active block className="col-span-2" size="small" />
          <Skeleton.Input active block className="col-span-3" size="small" />
          <Skeleton.Input active className="col-span-1" size="small" />
        </div>
      ))}
    </div>
  )
}
