import { Skeleton } from 'antd'

interface CardHeaderSkeletonProps {
  withAction?: boolean
}

export default function CardHeaderSkeleton({ withAction = false }: CardHeaderSkeletonProps) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <Skeleton
        active
        className="w-1/2"
        paragraph={{ rows: 1, width: '80%' }}
        title={{ width: '60%' }}
      />
      {withAction && <Skeleton.Button active className="!w-[60px]" size="small" />}
    </div>
  )
}
