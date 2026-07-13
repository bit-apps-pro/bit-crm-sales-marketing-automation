import { Divider, Skeleton } from 'antd'

export default function EntityCreateSkeleton() {
  return (
    <section className="col-span-2 space-y-2 rounded-md border border-solid border-[#E5E3FE] bg-white px-4 py-2 dark:border-neutral-700 dark:bg-transparent">
      <div className="bg-white text-end dark:bg-transparent">
        <Skeleton.Button active size="large" style={{ height: 40, width: 80 }} />
      </div>
      <Divider />
      <div className="space-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="grid w-full grid-cols-2 gap-4" key={i}>
            <div className="space-y-2">
              <Skeleton.Input active size="small" style={{ height: 16, width: 100 }} />
              <Skeleton.Input active className="w-full" size="large" />
            </div>
            <div className="space-y-2">
              <Skeleton.Input active size="small" style={{ height: 16, width: 100 }} />
              <Skeleton.Input active className="w-full" size="large" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
