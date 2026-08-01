import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { componentsTokenLight, lightThemeConfig } from '@config/theme'
import { mapInvoiceResponseToPreviewData } from '@pages/Invoice/shared/map-invoice-preview-data'
import InvoicePreview from '@pages/Invoice/ui/invoice-preview'
import InvoicePreviewSkeleton from '@utilities/invoice-preview-skeleton/invoice-preview-skeleton'
import { ConfigProvider, Empty, message, notification, theme } from 'antd'
import { useEffect, useMemo } from 'react'

import usePublicInvoice from './data/use-public-invoice'
import PublicPayCard from './ui/public-pay-card'

const { defaultAlgorithm } = theme

export default function PublicInvoiceApp() {
  const [notificationApi, contextHolderNotification] = notification.useNotification()
  const [messageApi, contextHolderMessage] = message.useMessage()
  const notifyContextValue = useMemo(
    () => ({ messageApi, notificationApi }),
    [messageApi, notificationApi]
  )

  // Checkout redirects back here with ?payment=success once the order is paid.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('payment') !== 'success') return

    url.searchParams.delete('payment')
    window.history.replaceState(window.history.state, '', url)
    messageApi.success(__('Payment received. Thank you!'), 5)
  }, [messageApi])

  return (
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,
        components: componentsTokenLight,
        token: lightThemeConfig
      }}
    >
      <NotifyContext.Provider value={notifyContextValue}>
        {contextHolderNotification}
        {contextHolderMessage}
        <PublicInvoiceContent />
      </NotifyContext.Provider>
    </ConfigProvider>
  )
}

function PublicInvoiceContent() {
  const { invoiceData, isInvoiceError, isInvoicePending } = usePublicInvoice()

  if (isInvoicePending && !isInvoiceError) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <InvoicePreviewSkeleton />
      </div>
    )
  }

  if (isInvoiceError || !invoiceData) {
    return (
      <Empty
        className="flex h-screen flex-col items-center justify-center"
        description={__('Invoice not found')}
      />
    )
  }

  const previewData = mapInvoiceResponseToPreviewData({
    contact: invoiceData.contact,
    currencyData: invoiceData.currency_data,
    deal: invoiceData.deal,
    invoice: invoiceData.invoice,
    lineItems: invoiceData.line_items
  })

  return (
    <div className="min-h-screen bg-slate-100 py-6 lg:py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="order-2 min-w-0 overflow-x-auto lg:order-1">
          <InvoicePreview
            businessSettings={invoiceData.business_settings}
            data={previewData}
            termName={invoiceData.term_name}
          />
        </div>
        <aside className="order-1 lg:sticky lg:top-6 lg:order-2">
          <PublicPayCard
            currencyData={invoiceData.currency_data}
            isPayable={invoiceData.is_payable}
            isWooActive={invoiceData.is_woo_active}
            partialPaymentAllowed={invoiceData.partial_payment_allowed}
            payments={invoiceData.payments}
            status={invoiceData.invoice.status}
            summary={invoiceData.payment_summary ?? undefined}
            wooPayment={invoiceData.woo_payment}
          />
        </aside>
      </div>
    </div>
  )
}
