import { Skeleton } from 'antd'

import InvoiceDocumentSkeleton from '../invoice-skeleton/invoice-document-skeleton'
import useInvoicePageScale, { INVOICE_PAGE_WIDTH } from '../invoice-skeleton/use-invoice-page-scale'

/** Mirrors the invoice/quote view layout so nothing shifts when the data arrives. */
export default function InvoicePreviewSkeleton() {
  const { containerRef, scale } = useInvoicePageScale()

  return (
    <div className="space-y-4 px-6 py-4 dark:bg-transparent">
      {/* Breadcrumb and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton.Input active size="small" style={{ width: 200 }} />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton.Button active shape="round" style={{ width: 100 }} />
          <Skeleton.Button active shape="round" style={{ width: 120 }} />
          <Skeleton.Button active shape="round" style={{ width: 90 }} />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-center gap-4 lg:flex-row">
        {/* Preview - Left Column: the same A4 fitting as the loaded page */}
        <div
          className="w-full min-w-0 flex-1"
          ref={containerRef}
          style={{ aspectRatio: '210 / 297', maxWidth: INVOICE_PAGE_WIDTH }}
        >
          <div style={{ width: INVOICE_PAGE_WIDTH, zoom: scale }}>
            <InvoiceDocumentSkeleton className="min-h-[1123px] rounded-lg bg-white p-16 dark:bg-neutral-900" />
          </div>
        </div>

        {/* Sidebar Panels - Right Column */}
        <div className="w-full md:w-96">
          <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
            {[1, 2].map(panel => (
              <div
                className="space-y-4 border-0 border-b border-solid border-[#EBEAFF] px-4 py-3 last:border-b-0 dark:border-neutral-700"
                key={panel}
              >
                <Skeleton.Input active size="small" style={{ width: 120 }} />
                <div className="space-y-3 pb-2">
                  <Skeleton.Input active block size="small" />
                  <Skeleton.Input active block size="small" style={{ width: '80%' }} />
                  <Skeleton.Input active block size="small" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
