import NotifyContext from '@common/context/NotifyContext'
import { direction } from '@common/helpers/direction'
import { __ } from '@common/helpers/i18nWrap'
import useBreakpoint from '@common/hooks/use-breakpoint'
import { componentsTokenLight, lightThemeConfig, smallScreenTypographyTokens } from '@config/theme'
import { mapInvoiceResponseToPreviewData } from '@pages/Invoice/shared/map-invoice-preview-data'
import InvoicePreview from '@pages/Invoice/ui/invoice-preview'
import useInvoicePageScale, {
  INVOICE_PAGE_WIDTH
} from '@utilities/invoice-skeleton/use-invoice-page-scale'
import { ConfigProvider, Empty, message, notification, theme } from 'antd'
import { useEffect, useMemo } from 'react'

import usePublicInvoice from './data/use-public-invoice'
import PublicPayCard from './ui/public-pay-card'
import InvoiceSkeleton from './ui/public-pay-card/internal/invoice-skeleton'

const { defaultAlgorithm } = theme

export default function PublicInvoiceApp() {
  const [notificationApi, contextHolderNotification] = notification.useNotification()
  const [messageApi, contextHolderMessage] = message.useMessage()
  const isMdUp = useBreakpoint('md')
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
      direction={direction}
      theme={{
        algorithm: defaultAlgorithm,
        components: componentsTokenLight,
        token: isMdUp ? lightThemeConfig : { ...lightThemeConfig, ...smallScreenTypographyTokens }
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
  const { invoiceData, isInvoiceError, isInvoiceLoading } = usePublicInvoice()
  const { containerRef, scale } = useInvoicePageScale()

  if (isInvoiceLoading && !isInvoiceError) {
    return <InvoiceSkeleton />
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
        {/*
          The same A4 fitting as the admin invoice page: the page renders at its designed
          794px width and `zoom` shrinks it to the column. Left to reflow, a phone
          squeezed the preview's columns until addresses and dates broke every few
          letters and the line items scrolled sideways inside the page.
        */}
        <div
          className="order-2 mx-auto w-full min-w-0 lg:order-1"
          ref={containerRef}
          // Capped at the page width: the preview never upscales, so a wider column
          // would leave empty space beside and below it.
          style={{ aspectRatio: '210 / 297', maxWidth: INVOICE_PAGE_WIDTH }}
        >
          <div style={{ width: INVOICE_PAGE_WIDTH, zoom: scale }}>
            <InvoicePreview
              businessSettings={invoiceData.business_settings}
              data={previewData}
              termName={invoiceData.term_name}
            />
          </div>
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
