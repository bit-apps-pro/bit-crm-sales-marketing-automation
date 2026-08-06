import StageSelectBarSkeleton from '@pages/deal/internal/deal-overview/ui/stage-select-bar-skeleton'
import { Skeleton } from 'antd'

export default function EntitySkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Skeleton.Input active size="large" style={{ height: 28, width: 200 }} />
        <div className="flex items-center gap-2">
          <Skeleton.Button active size="small" style={{ height: 28, width: 36 }} />
          <Skeleton.Button active size="small" style={{ height: 28, width: 36 }} />
        </div>
      </div>
      <section className="flex flex-col rounded-md border border-solid border-[#E5E3FE] p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <Skeleton.Input active size="large" style={{ height: 28, marginBottom: 8, width: 200 }} />
        <Skeleton.Input active size="small" style={{ height: 18, marginBottom: 4, width: 150 }} />
        <Skeleton.Input active size="small" style={{ height: 14, width: 120 }} />
      </section>

      <section className="mb-6 space-y-2 rounded-md">
        <header className="sticky left-0 top-0 z-10 pb-4">
          <div className="flex justify-start gap-2 border-b border-gray-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton.Input active className="border-b-2 border-transparent" key={i} size="small" />
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <section className="col-span-2 rounded-md border border-solid border-[#E5E3FE] bg-white dark:border-neutral-700 dark:bg-transparent">
            <div className="sticky top-0 z-10 flex items-center justify-end rounded-t-md border-0 bg-white px-4 py-2 dark:bg-transparent">
              <Skeleton.Button active size="large" style={{ height: 40, width: 80 }} />
            </div>
            <StageSelectBarSkeleton />
            <div className="mt-4 space-y-4 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton.Input active className="w-full" key={i} size="large" />
              ))}
            </div>
          </section>

          <aside className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-transparent">
            <div>
              <section className="border-0 border-b border-solid border-[#E5E3FE] dark:border-neutral-700">
                <div className="space-y-4 border-b border-gray-200 p-4">
                  <Skeleton.Input active size="small" />
                  <Skeleton.Input active className="w-full" size="large" />
                </div>
              </section>

              <section className="space-y-4 rounded-md border border-[#EBEAFF] p-4 dark:border-neutral-700">
                <Skeleton.Input active size="small" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div className="flex items-start space-x-3" key={i}>
                      <Skeleton.Avatar active size="small" />
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-col gap-2">
                          <Skeleton.Input active size="small" style={{ height: 14, width: '80%' }} />
                          <Skeleton.Input active size="small" style={{ height: 12, width: '60%' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
