import { Card, Skeleton } from 'antd'

export default function InvoiceSkeleton() {
  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="space-y-4">
        {/* Breadcrumb and Submit Button */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Skeleton.Input active className="w-full sm:w-auto" size="small" style={{ width: 200 }} />
          <Skeleton.Button active className="w-full sm:w-auto" size="large" style={{ width: 120 }} />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form Card */}
          <Card className="border lg:col-span-2">
            <div className="space-y-6">
              {/* Title */}
              <Skeleton.Input active block className="mx-auto w-3/4 sm:w-1/2 md:w-2/5" size="large" />

              {/* Logo and Invoice Information */}
              <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
                <Skeleton.Image active className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28" />
                <div className="w-full flex-1 space-y-3">
                  <Skeleton.Input active block className="w-full" size="large" />
                  <Skeleton.Input active block className="w-full" size="large" />
                  <Skeleton.Input active block className="w-full" size="large" />
                </div>
              </div>

              {/* Sender and Deal Information */}
              <div className="grid h-full grid-cols-1 gap-10 lg:grid-cols-2">
                <div className="space-y-4">
                  <Skeleton.Input active size="small" style={{ width: 120 }} />
                  <Skeleton.Input active block size="large" />
                  <Skeleton.Input active block size="large" />
                  <Skeleton.Input active block size="large" />
                </div>
                <div className="space-y-4">
                  <Skeleton.Input active size="small" style={{ width: 120 }} />
                  <Skeleton.Input active block size="large" />
                </div>
              </div>

              {/* Top Section */}
              <div className="space-y-4">
                <Skeleton.Input active block size="large" />
                <Skeleton.Input active block size="large" />
              </div>

              {/* Product Line Items */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Skeleton.Input
                    active
                    className="w-full sm:w-auto"
                    size="small"
                    style={{ width: 120 }}
                  />
                  <Skeleton.Input
                    active
                    className="w-full sm:w-auto"
                    size="small"
                    style={{ width: 180 }}
                  />
                </div>

                {/* Table - Scrollable on mobile */}
                <div className="space-y-2 overflow-x-auto">
                  {/* Table Header */}
                  <div className="flex min-w-[600px] gap-5">
                    <Skeleton.Input active block className="flex-[2]" size="large" />
                    <Skeleton.Input active block className="flex-1" size="large" />
                    <Skeleton.Input active block className="flex-1" size="large" />
                    <Skeleton.Input active block className="flex-1" size="large" />
                  </div>

                  {/* Table Rows */}
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div className="flex min-w-[600px] gap-5" key={index}>
                      <Skeleton.Input active block className="flex-[2]" size="large" />
                      <Skeleton.Input active block className="flex-1" size="large" />
                      <Skeleton.Input active block className="flex-1" size="large" />
                      <Skeleton.Input active block className="flex-1" size="large" />
                    </div>
                  ))}
                </div>

                {/* Add Line Item and Summary */}
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <Skeleton.Button
                    active
                    className="w-full sm:w-auto"
                    size="large"
                    style={{ width: 150 }}
                  />
                  <Skeleton.Input
                    active
                    className="w-full sm:w-auto"
                    size="small"
                    style={{ width: 200 }}
                  />
                </div>

                {/* Total Summary */}
                <div className="flex justify-end">
                  <div className="w-full space-y-2 md:w-2/3 lg:w-1/2">
                    <Skeleton.Input active block size="large" />
                    <Skeleton.Input active block size="large" />
                    <Skeleton.Input active block size="large" />
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="space-y-4">
                <Skeleton.Input active block size="large" />
                <Skeleton.Input active block size="large" />
              </div>
            </div>
          </Card>

          {/* Preview Card */}
          <div
            className="min-h-[400px] lg:sticky lg:top-4 lg:self-start"
            style={{ aspectRatio: '210 / 297' }}
          >
            <Card className="h-full border">
              <div className="flex h-full flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Skeleton.Image active className="h-12 w-12 sm:h-16 sm:w-16" />
                  <Skeleton active paragraph={{ rows: 4 }} />
                </div>
                <div className="space-y-2">
                  <Skeleton.Input active block size="small" />
                  <Skeleton.Input active block size="small" />
                  <Skeleton.Input active block size="small" />
                </div>
                <div className="hidden xl:block">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
