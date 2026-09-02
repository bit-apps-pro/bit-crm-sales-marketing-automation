import { Skeleton } from 'antd'

import InvoiceDocumentSkeleton from '../invoice-skeleton/invoice-document-skeleton'

export default function InvoicePreviewSkeleton() {
  return (
    <div className="space-y-4 p-6 dark:bg-transparent">
      {/* Breadcrumb and Action Buttons */}
      <div className="flex items-center justify-between">
        <Skeleton.Input active size="small" style={{ width: 200 }} />
        <div className="flex gap-2">
          <Skeleton.Button active style={{ width: 120 }} />
          <Skeleton.Button active style={{ width: 100 }} />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-center gap-4 lg:flex-row">
        {/* Invoice Preview - Left Column */}
        <div className="flex-1">
          <InvoiceDocumentSkeleton className="min-h-[1123px] rounded-md bg-white p-16 shadow-sm dark:bg-neutral-900" />
        </div>

        {/* Timeline Section - Right Column */}
        <div className="w-full space-y-4 rounded-md border border-solid border-[#EBEAFF] bg-white p-4 md:w-96 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="w-full space-y-4 rounded-md bg-white p-4 dark:bg-neutral-900">
            <Skeleton.Input active size="small" style={{ width: 100 }} />
            <div className="space-y-3">
              <Skeleton.Avatar active size="small" />
              <Skeleton.Input active block size="small" />
              <Skeleton.Input active block size="small" style={{ width: '80%' }} />
            </div>
            <div className="space-y-3">
              <Skeleton.Avatar active size="small" />
              <Skeleton.Input active block size="small" />
              <Skeleton.Input active block size="small" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
