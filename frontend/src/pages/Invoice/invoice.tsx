import { CaretRightOutlined, LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import Timeline from '@features/timeline'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import If from '@utilities/If'
import InvoicePreviewSkeleton from '@utilities/invoice-preview-skeleton/invoice-preview-skeleton'
import { Button, Collapse, Empty, Space } from 'antd'
import { LuSend } from 'react-icons/lu'
import { useParams } from 'react-router'

import useInvoice from './data/use-invoice'
import useInvoiceSend from './data/use-invoice-send'
import { mapInvoiceResponseToPreviewData } from './shared/map-invoice-preview-data'
import InvoiceActions from './ui/invoice-actions'
import InvoicePreview from './ui/invoice-preview'

export default function Invoice() {
  const { id } = useParams()
  const numericId = Number(id)
  const { contact, currencyData, deal, invoice, isInvoiceLoading, lineItems } = useInvoice(numericId)
  const { isSendingEmail, sendEmail } = useInvoiceSend()

  if (isInvoiceLoading) {
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

  return (
    <div className="space-y-4 px-6 py-4 dark:bg-transparent">
      <div className="flex items-center justify-between">
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
        <Space>
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
        </Space>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-center gap-4 lg:flex-row">
        <div className="flex-1">
          <InvoicePreview data={previewData} />
        </div>
        <div className="w-full space-y-4 md:w-96">
          <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <Collapse
              bordered={false}
              className="bg-white dark:bg-neutral-900"
              defaultActiveKey={['timeline']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              items={[
                {
                  children: <Timeline entityId={numericId} module={MODULES.INVOICE} />,
                  key: 'timeline',
                  label: <span className="text-slate-500">{__('Timeline')}</span>
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
