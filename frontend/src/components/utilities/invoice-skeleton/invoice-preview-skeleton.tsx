import { isRtl } from '@common/helpers/direction'

import InvoiceDocumentSkeleton from './invoice-document-skeleton'
import useInvoicePageScale, { INVOICE_PAGE_WIDTH } from './use-invoice-page-scale'

export default function InvoicePreviewSkeleton() {
  const { containerRef, scale } = useInvoicePageScale()

  return (
    <div
      className="lg:sticky lg:top-4 lg:self-start"
      ref={containerRef}
      style={{ aspectRatio: '210 / 297' }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: isRtl() ? 'top right' : 'top left',
          width: INVOICE_PAGE_WIDTH
        }}
      >
        <InvoiceDocumentSkeleton className="rounded-md bg-white p-16 dark:bg-neutral-900" />
      </div>
    </div>
  )
}
