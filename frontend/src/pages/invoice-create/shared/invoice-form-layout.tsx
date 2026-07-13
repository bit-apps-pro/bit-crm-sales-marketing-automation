import { __ } from '@common/helpers/i18nWrap'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import { mapEditorStateToPreviewData } from '@pages/Invoice/shared/map-invoice-preview-data'
import InvoicePreview from '@pages/Invoice/ui/invoice-preview'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import { Card, Form, type FormInstance } from 'antd'
import { type ReactNode, useEffect, useRef, useState } from 'react'

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
  mode: 'create' | 'edit'
}

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123

function calculateScale(containerWidth: number, containerHeight: number) {
  if (!containerWidth || !containerHeight) return 1
  const scaleW = containerWidth / PAGE_WIDTH
  const scaleH = containerHeight / PAGE_HEIGHT
  return Math.min(scaleW, scaleH, 1) // clamp to 1 so it doesn't upscale
}

export default function InvoiceFormLayout({ children, form, mode }: InvoiceFormLayoutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

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

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const ro = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect
      setScale(calculateScale(width, height))
    })

    ro.observe(element)
    return () => ro.disconnect()
  }, [])

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
            className="ml-2"
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
          <InvoiceSubmitButton form={form} mode={mode} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border lg:col-span-2">{children}</Card>
          <div
            className="lg:sticky lg:top-4 lg:self-start"
            ref={containerRef}
            style={{ aspectRatio: '210 / 297' }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: PAGE_WIDTH
              }}
            >
              <InvoicePreview data={previewData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
