import { Skeleton } from 'antd'

export default function CurrencyFormSkeleton({ quantity = 1 }: { quantity?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: quantity }).map((_, index) => (
        <div className="space-y-2" key={index}>
          <Skeleton.Input active size="small" />
          <Skeleton.Input active block size="large" />
        </div>
      ))}
    </div>
  )
}
