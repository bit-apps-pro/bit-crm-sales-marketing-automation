import { Skeleton } from 'antd'

interface BusinessSettingsSkeletonProps {
  addressCount?: number
  infoCount?: number
}

export default function BusinessSettingsSkeleton({
  addressCount = 4,
  infoCount = 6
}: BusinessSettingsSkeletonProps) {
  return (
    <div>
      <div className="mb-8 grid grid-cols-1">
        <Skeleton.Input active className="mb-2 h-6 w-32" size="small" />
        <Skeleton.Input active className="mb-4 h-4 w-96" size="small" />
        <Skeleton.Button active className="h-32 w-52" size="large" />
      </div>

      <Skeleton.Input active className="mb-4 h-6 w-40" size="small" />
      <div className="mb-8 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        {Array.from({ length: infoCount }).map((_, index) => (
          <div key={index}>
            <Skeleton.Input active block className="mb-2 h-4 w-32" size="small" />
            <Skeleton.Input active block size="large" />
          </div>
        ))}
      </div>

      <Skeleton.Input active className="mb-4 h-6 w-40" size="small" />
      <div className="mb-8 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Skeleton.Input active block className="mb-2 h-4 w-32" size="small" />
          <Skeleton.Input active block size="large" />
        </div>
        {Array.from({ length: addressCount }).map((_, index) => (
          <div key={index}>
            <Skeleton.Input active block className="mb-2 h-4 w-32" size="small" />
            <Skeleton.Input active block size="large" />
          </div>
        ))}
      </div>
    </div>
  )
}
