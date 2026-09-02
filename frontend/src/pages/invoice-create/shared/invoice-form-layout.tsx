import CAPABILITIES from '@common/constants/capabilities'
import { isRtl } from '@common/helpers/direction'
import { __ } from '@common/helpers/i18nWrap'
import IntegrationSettingsNavigation from '@features/integration-settings-navigation'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import { mapEditorStateToPreviewData } from '@pages/Invoice/shared/map-invoice-preview-data'
import InvoicePreview from '@pages/Invoice/ui/invoice-preview'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import InvoicePreviewSkeleton from '@utilities/invoice-skeleton/invoice-preview-skeleton'
import useInvoicePageScale, {
  INVOICE_PAGE_WIDTH
} from '@utilities/invoice-skeleton/use-invoice-page-scale'
import { Card, Form, type FormInstance } from 'antd'
import { type ReactNode } from 'react'

import {
  useContactInformationSelect,
  useDealInformationSelect,
  useInvoiceBottomSectionNotesSelect,
  useInvoiceCurrencyDataSelect,
  useInvoiceLineItemsSelect,
  useInvoiceNumberSelect,
  useInvoiceTopSectionNotesSelect
} from '../state/use-invoice-create-store'
import InvoiceSubmitButton from '../ui/invoice-submit-button'

interface InvoiceFormLayoutProps {
  children: ReactNode
  form: FormInstance
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export default function InvoiceFormLayout({
  children,
  form,
  isLoading = false,
  mode
}: InvoiceFormLayoutProps) {
  const { containerRef, scale } = useInvoicePageScale()

  const topSectionNotes = useInvoiceTopSectionNotesSelect()
  const bottomSectionNotes = useInvoiceBottomSectionNotesSelect()
  const contact = useContactInformationSelect()
  const dealInformation = useDealInformationSelect()
  const currencyData = useInvoiceCurrencyDataSelect()
  const invoiceNumber = useInvoiceNumberSelect()
  const lineItems = useInvoiceLineItemsSelect()
  const taxOption = useTaxOptionSelect()
  const grossDiscount = useGrossDiscountSelect()
  const grossDiscountType = useGrossDiscountTypeSelect()

  const invoicePrefix = Form.useWatch('invoicePrefix', form)
  const invoiceDate = Form.useWatch('invoiceDate', form)
  const dueDate = Form.useWatch('dueDate', form)
  const invoiceTerm = Form.useWatch('invoiceTerm', form)

  const previewData = mapEditorStateToPreviewData({
    bottomSectionNotes,
    contact,
    currencyData,
    deal: dealInformation.isDealSelected ? dealInformation : undefined,
    formValues: { dueDate, invoiceDate, invoicePrefix, invoiceTerm },
    grossDiscountAmount: grossDiscount,
    grossDiscountType,
    invoiceNumber,
    lineItems,
    taxOption,
    topSectionNotes
  })

  return (
    <div className="px-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Breadcrumb
            className="ms-2"
            items={[
              {
                title: __('Invoices'),
                to: '/invoices'
              },
              {
                title: mode === 'create' ? __('Create Invoice') : __('Edit Invoice')
              }
            ]}
          />
          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <IntegrationSettingsNavigation
                capability={CAPABILITIES.SETTING.INVOICE}
                label={__('Payment settings')}
                to="/settings/invoice-settings?tab=payments"
                tooltip={__(
                  'Invoice payments are collected through WooCommerce. Enable "Accept invoice payments via WooCommerce" here so customers can pay this invoice at checkout.'
                )}
              />
            )}
            <InvoiceSubmitButton form={form} mode={mode} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border border-[#EBEAFF] shadow-none lg:col-span-2 dark:border-neutral-700 dark:bg-neutral-900">
            {children}
          </Card>
          {isLoading ? (
            <InvoicePreviewSkeleton />
          ) : (
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
                <InvoicePreview data={previewData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
