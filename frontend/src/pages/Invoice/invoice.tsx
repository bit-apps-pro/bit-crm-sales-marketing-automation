import { CaretRightOutlined, LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { isRtl } from '@common/helpers/direction'
import { __ } from '@common/helpers/i18nWrap'
import Timeline from '@features/timeline'
import useBusinessSettings from '@pages/general-settings/internal/business-settings/data/use-business-settings'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import If from '@utilities/If'
import InvoicePreviewSkeleton from '@utilities/invoice-preview-skeleton/invoice-preview-skeleton'
import useInvoicePageScale, {
  INVOICE_PAGE_WIDTH
} from '@utilities/invoice-skeleton/use-invoice-page-scale'
import { Button, Collapse, Empty } from 'antd'
import { LuSend } from 'react-icons/lu'
import { useParams } from 'react-router'

import useInvoice from './data/use-invoice'
import useInvoiceSend from './data/use-invoice-send'
import { mapInvoiceResponseToPreviewData } from './shared/map-invoice-preview-data'
import InvoiceActions from './ui/invoice-actions'
import getInvoicePaymentPanels from './ui/invoice-payment-panels'
import InvoicePreview from './ui/invoice-preview'

export default function Invoice() {
  const { id } = useParams()
  const numericId = Number(id)
  const { contact, currencyData, deal, invoice, isInvoiceLoading, lineItems } = useInvoice(numericId)
  const { isBusinessSettingsLoading } = useBusinessSettings()
  const { isSendingEmail, sendEmail } = useInvoiceSend()
  const { containerRef, scale } = useInvoicePageScale()

  if (isInvoiceLoading || isBusinessSettingsLoading) {
    return <InvoicePreviewSkeleton />
  }

  if (!invoice) return <Empty className="flex h-full flex-col items-center justify-center" />

  const previewData = mapInvoiceResponseToPreviewData({
    contact,
    currencyData,
    deal,
    invoice,
    lineItems
  })

  const sidebarPanels = [
    ...getInvoicePaymentPanels({
      currencyData,
      invoiceId: numericId,
      invoiceStatus: invoice.status
    }),
    {
      children: <Timeline entityId={numericId} module={MODULES.INVOICE} />,
      key: 'timeline',
      label: <span className="text-slate-500">{__('Timeline')}</span>
    }
  ]

  return (
    <div className="space-y-4 px-6 py-4 dark:bg-transparent">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Breadcrumb
          items={[
            {
              title: __('Invoices'),
              to: '/invoices'
            },
            {
              title: isInvoiceLoading ? <LoadingOutlined /> : `${invoice.invoice_prefix}-${invoice.id}`
            }
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <InvoiceActions status={invoice.status} />
          <If conditions={checkCapability(CAPABILITIES.INVOICE.VIEW)}>
            <Button
              className="rounded-full"
              icon={<LuSend />}
              loading={isSendingEmail}
              onClick={() => sendEmail({ id: String(numericId) })}
              size="middle"
              type="primary"
            >
              {__('Send')}
            </Button>
          </If>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-center gap-4 lg:flex-row">
        {/*
          The preview is a fixed 794px A4 page, so it cannot shrink on its own -- below
          about 860px it would simply overflow the viewport. Scaling it down here mirrors
          what the create/edit page already does with the same hook; `aspect-ratio` keeps
          the placeholder the right shape while `zoom` does the fitting. `zoom`, not a
          `transform: scale()`: a transform only shrinks the painted page, the layout box
          stays at full A4 height, so on a phone the container kept ~1100px of height for
          a ~400px page and left a large empty gap above the sidebar.
        */}
        <div className="w-full min-w-0 flex-1" ref={containerRef} style={{ aspectRatio: '210 / 297' }}>
          <div style={{ width: INVOICE_PAGE_WIDTH, zoom: scale }}>
            <InvoicePreview data={previewData} />
          </div>
        </div>
        <div className="w-full space-y-4 md:w-96">
          <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <Collapse
              bordered={false}
              className="bg-white dark:bg-neutral-900"
              // Every sidebar section starts expanded, whichever ones render.
              defaultActiveKey={sidebarPanels.flatMap(panel => (panel.key ? String(panel.key) : []))}
              expandIcon={({ isActive }) =>
                isRtl() ? (
                  <CaretRightOutlined rotate={isActive ? -90 : 0} />
                ) : (
                  <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )
              }
              items={sidebarPanels}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
