import { Skeleton } from 'antd'

interface CardHeaderSkeletonProps {
  withAction?: boolean
}

export default function CardHeaderSkeleton({ withAction = false }: CardHeaderSkeletonProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton.Input active className="!h-6 !min-w-[120px]" size="small" />
        {withAction && <Skeleton.Button active className="!h-6 !w-[60px] !rounded-full" size="small" />}
      </div>
      <div className="mt-1.5">
        <Skeleton.Input active className="!h-[14px] !min-h-0 !min-w-[180px]" size="small" />
      </div>
    </div>
  )
}
