import { Skeleton } from 'antd'

export default function StageSelectBarSkeleton({ total = 5 }: { total?: number }) {
  return (
    <div className="flex w-full items-center gap-1 px-1">
      {Array.from({ length: total }).map((_, index) => (
        <Skeleton.Button active block key={index} size="large" />
      ))}
    </div>
  )
}
