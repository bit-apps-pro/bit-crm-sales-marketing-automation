import { Skeleton } from 'antd'

export default function PrefixSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton.Input active className="mb-2 h-5 w-32" />
        <Skeleton.Input active block size="large" />
      </div>
      <div className="space-y-2">
        <Skeleton.Input active className="h-3 w-full" />
        <Skeleton.Input active className="h-3 w-3/4" />
      </div>
      <div className="flex justify-end">
        <Skeleton.Button active className="rounded-full" />
      </div>
    </div>
  )
}
