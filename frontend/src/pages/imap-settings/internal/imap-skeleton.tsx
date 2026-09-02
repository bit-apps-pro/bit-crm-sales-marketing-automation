import { Card, Skeleton } from 'antd'

export default function ImapSkeleton({ quantity }: { quantity: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: quantity }).map((_, index) => (
        <Card className="h-28 w-full overflow-hidden" key={index} size="small">
          <Skeleton active />
        </Card>
      ))}
    </div>
  )
}
