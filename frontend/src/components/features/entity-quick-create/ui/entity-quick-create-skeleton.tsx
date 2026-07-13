import { Skeleton } from 'antd'

export default function EntityQuickCreateSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton.Input active block key={i} />
      ))}
    </div>
  )
}
