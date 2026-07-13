import { Skeleton } from 'antd'

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
          <div className="min-h-[1123px] space-y-5 rounded-md bg-white p-16 shadow-sm dark:bg-neutral-900">
            {/* Invoice Info Section - Logo and Invoice Details */}
            <div className="grid grid-cols-2 items-center gap-4">
              <div>
                <Skeleton.Image active style={{ height: 80, width: 128 }} />
              </div>
              <div className="space-y-3 text-right">
                <Skeleton.Input active size="large" style={{ width: 150 }} />
                <div className="space-y-2">
                  <Skeleton.Input active size="small" style={{ width: 200 }} />
                  <Skeleton.Input active size="small" style={{ width: 200 }} />
                  <Skeleton.Input active size="small" style={{ width: 200 }} />
                </div>
              </div>
            </div>

            {/* Sender and Receiver Section */}
            <div className="grid grid-cols-2 gap-4 rounded-lg p-1">
              <div className="space-y-2">
                <Skeleton.Input active size="small" style={{ width: 80 }} />
                <Skeleton.Input active block size="small" />
                <Skeleton.Input active block size="small" />
                <Skeleton.Input active block size="small" />
                <Skeleton.Input active block size="small" />
              </div>
              <div className="space-y-2">
                <Skeleton.Input active size="small" style={{ width: 80 }} />
                <Skeleton.Input active block size="small" />
                <Skeleton.Input active block size="small" />
                <Skeleton.Input active block size="small" />
                <Skeleton.Input active block size="small" />
              </div>
            </div>

            {/* Top Section Notes */}
            <div className="space-y-2">
              <Skeleton.Input active size="small" style={{ width: 100 }} />
              <Skeleton.Input active block size="small" />
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              {/* Table Header */}
              <div className="flex gap-2 border-b pb-2">
                <Skeleton.Input active size="small" style={{ width: '40%' }} />
                <Skeleton.Input active size="small" style={{ width: '15%' }} />
                <Skeleton.Input active size="small" style={{ width: '15%' }} />
                <Skeleton.Input active size="small" style={{ width: '15%' }} />
                <Skeleton.Input active size="small" style={{ width: '15%' }} />
              </div>

              {/* Table Rows */}
              {[1, 2, 3].map(i => (
                <div className="flex gap-2 py-2" key={i}>
                  <div style={{ width: '40%' }}>
                    <Skeleton.Input active block size="small" />
                    <Skeleton.Input active block size="small" style={{ marginTop: 4, width: '70%' }} />
                  </div>
                  <Skeleton.Input active size="small" style={{ width: '15%' }} />
                  <Skeleton.Input active size="small" style={{ width: '15%' }} />
                  <Skeleton.Input active size="small" style={{ width: '15%' }} />
                  <Skeleton.Input active size="small" style={{ width: '15%' }} />
                </div>
              ))}
            </div>

            {/* Summary Section */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <Skeleton.Input active size="small" style={{ width: 100 }} />
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                </div>
                <div className="flex justify-between">
                  <Skeleton.Input active size="small" style={{ width: 100 }} />
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                </div>
                <div className="flex justify-between border-t pt-2">
                  <Skeleton.Input active size="small" style={{ width: 100 }} />
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                </div>
              </div>
            </div>

            {/* Bottom Section Notes */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton.Input active size="small" style={{ width: 100 }} />
                <Skeleton.Input active block size="small" />
                <Skeleton.Input active block size="small" style={{ width: '80%' }} />
              </div>
              <div className="space-y-2">
                <Skeleton.Input active size="small" style={{ width: 100 }} />
                <Skeleton.Input active block size="small" />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section - Right Column */}
        <div className="w-full space-y-4 md:w-96">
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
