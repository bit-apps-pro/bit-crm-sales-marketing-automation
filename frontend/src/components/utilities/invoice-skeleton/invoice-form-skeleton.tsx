import { Skeleton } from 'antd'

export default function InvoiceFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Invoice Title */}
      <div className="mb-3 flex justify-center">
        <Skeleton.Input active className="!h-10 !w-44 !min-w-0" size="large" />
      </div>

      {/* Logo | Invoice Information | Business Information | Deal Select */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Logo */}
        <div className="flex-1">
          <Skeleton.Image active className="!h-32 !w-48" />
        </div>

        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton.Input active block key={index} size="small" />
          ))}
        </div>

        {/* Business Information */}
        <div className="flex h-full flex-col space-y-4 rounded-md border border-solid border-[#EBEAFF] p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex h-10 items-center">
            <Skeleton.Input active block size="small" />
          </div>
          <div className="flex-1 space-y-2 rounded-lg border border-solid border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <Skeleton.Input active className="!w-40 !min-w-0" size="small" />
            <Skeleton.Node active className="w-full" />
          </div>
        </div>

        {/* Deal Select */}
        <div className="flex h-full flex-col space-y-4 rounded-lg border border-solid border-[#EBEAFF] p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex h-10 items-center">
            <Skeleton.Input active block size="small" />
          </div>
          <div className="flex-1 space-y-2 rounded-lg border border-solid border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <Skeleton.Input active className="!w-40 !min-w-0" size="small" />
            <Skeleton.Node active className="w-full" />
          </div>
        </div>
      </div>

      {/* Top Section notes */}
      <div>
        <Skeleton.Input active className="mb-2 !w-36 !min-w-0" size="small" />
        <div className="rounded-md border border-solid border-gray-200 dark:border-neutral-700">
          <div className="border-0 border-b border-solid border-gray-200 p-2 dark:border-neutral-700">
            <Skeleton.Node active className="!h-5 w-40" />
          </div>
          <div className="space-y-2 p-3">
            <Skeleton.Input active block size="small" />
            <Skeleton.Input active block size="small" />
          </div>
        </div>
      </div>

      {/* Product Line Items */}
      <div className="space-y-4 pt-4">
        {/* Tax Calculation */}
        <div className="flex items-center justify-end gap-2">
          <Skeleton.Input active className="!w-44 !min-w-0" size="default" />
        </div>

        {/* Line Items Table */}
        <div className="overflow-hidden rounded-lg border border-solid border-gray-200 dark:border-neutral-700">
          <div className="flex gap-px bg-gray-200 dark:bg-neutral-700">
            <div className="flex-[3] bg-gray-50 p-2 dark:bg-neutral-800">
              <Skeleton.Input active className="!w-24 !min-w-0" size="small" />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="flex-1 bg-gray-50 p-2 dark:bg-neutral-800" key={index}>
                <Skeleton.Input active className="!w-full !min-w-0" size="small" />
              </div>
            ))}
            <div className="w-12 bg-gray-50 p-2 dark:bg-neutral-800" />
          </div>
          <div className="flex gap-px bg-gray-200 dark:bg-neutral-700">
            <div className="flex-[3] space-y-2 bg-white p-2 dark:bg-neutral-900">
              <Skeleton.Input active block size="default" />
              <Skeleton.Input active block size="default" />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="flex-1 bg-white p-2 dark:bg-neutral-900" key={index}>
                <Skeleton.Input active className="!w-full !min-w-0" size="default" />
              </div>
            ))}
            <div className="flex w-12 items-center justify-center bg-white p-2 dark:bg-neutral-900">
              <Skeleton.Avatar active className="!size-5" shape="square" />
            </div>
          </div>
        </div>

        {/* Add Line Item / Clear All and product counts */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton.Button active className="w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton.Input active className="w-72" size="small" />
          </div>
        </div>

        {/* Product Summary */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2 border-0 border-t border-solid border-gray-200 pt-4 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <Skeleton.Input active className="w-full" size="small" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton.Input active className="w-full" size="small" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton.Input active className="w-full" size="small" />
            </div>
            <div className="flex items-center justify-between border-0 border-t border-solid border-gray-200 pt-2 dark:border-neutral-700">
              <Skeleton.Input active className="w-full" size="small" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section notes */}
      <div className="space-y-5">
        <div>
          <Skeleton.Input active className="mb-2 !w-36 !min-w-0" size="small" />
          <div className="rounded-md border border-solid border-gray-200 dark:border-neutral-700">
            <div className="border-0 border-b border-solid border-gray-200 p-2 dark:border-neutral-700">
              <Skeleton.Node active className="!h-5 w-40" />
            </div>
            <div className="space-y-2 p-3">
              <Skeleton.Input active block size="small" />
              <Skeleton.Input active block size="small" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
