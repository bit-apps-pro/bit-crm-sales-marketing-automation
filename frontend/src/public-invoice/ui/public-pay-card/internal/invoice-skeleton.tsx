import InvoiceDocumentSkeleton from '@utilities/invoice-skeleton/invoice-document-skeleton'
import { Skeleton } from 'antd'

export default function InvoiceSkeleton() {
  return (
    <div className="min-h-screen bg-white py-6 lg:py-8 dark:bg-neutral-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="order-2 min-w-0 overflow-x-auto lg:order-1">
          <InvoiceDocumentSkeleton className="min-h-[1123px] rounded-lg bg-white p-16 dark:bg-neutral-900" />
        </div>
        <aside className="order-1 lg:sticky lg:top-6 lg:order-2">
          <PayCardSkeleton />
        </aside>
      </div>
    </div>
  )
}

function PayCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-solid border-[#EBEAFF] bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-3 p-7">
        <Skeleton.Input active size="small" style={{ width: 80 }} />
        <Skeleton.Button active style={{ width: 110 }} />
      </div>
      <div className="grid w-full gap-2 p-7">
        <Skeleton.Input active className="!w-full" size="small" />
        <Skeleton.Input active className="!w-full" size="small" />
      </div>

      <div className="space-y-7 p-7">
        <Skeleton.Input active block size="small" />
      </div>
    </div>
  )
}
