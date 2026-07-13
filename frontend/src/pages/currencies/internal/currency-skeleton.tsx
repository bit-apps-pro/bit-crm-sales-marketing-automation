import { Skeleton } from 'antd'

const centerMargin = '0 auto'

export default function CurrencySkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-8 py-12">
      <Skeleton.Image active />
      <div className="w-full max-w-lg">
        <Skeleton active paragraph={false} title={{ style: { margin: centerMargin }, width: '60%' }} />
      </div>
      <div className="w-full max-w-4xl">
        <Skeleton active paragraph={{ rows: 2, width: ['100%', '90%'] }} title={false} />
      </div>
      <div className="w-full max-w-xs">
        <Skeleton.Button active block className="rounded-full" size="large" />
      </div>
    </div>
  )
}
