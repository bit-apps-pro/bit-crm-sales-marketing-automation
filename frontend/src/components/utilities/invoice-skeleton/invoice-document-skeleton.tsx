import { Skeleton } from 'antd'

export default function InvoiceDocumentSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`space-y-5 border border-solid border-[#EBEAFF] dark:border-neutral-700 ${className}`}
    >
      {/* Invoice Info Section - Logo and Invoice Details */}
      <div className="grid grid-cols-2 items-center gap-4">
        <div>
          <Skeleton.Image active style={{ height: 80, width: 128 }} />
        </div>
        <div className="space-y-3 text-end">
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
  )
}
