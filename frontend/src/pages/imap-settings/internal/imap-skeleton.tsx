import { Card, Skeleton } from 'antd'

export default function ImapSkeleton({ quantity }: { quantity: number }) {
  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: quantity }).map((_, index) => (
        <Card className="h-28 w-64 overflow-hidden" key={index} size="small">
          <Skeleton active />
        </Card>
      ))}
    </div>
  )
}
