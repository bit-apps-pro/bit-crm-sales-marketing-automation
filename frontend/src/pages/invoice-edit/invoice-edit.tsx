import { type TaxOption } from '@features/product-line-items/shared/types'
import { useLineItemsStoreActions } from '@features/product-line-items/state/use-line-items-store'
import { useInvoiceCreateStoreActions } from '@pages/invoice-create/state/use-invoice-create-store'
import InvoiceForm from '@pages/invoice-create/ui/invoice-form'
import useInvoice from '@pages/Invoice/data/use-invoice'
import InvoiceSkeleton from '@utilities/invoice-skeleton/invoice-skeleton'
import { Form } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useParams } from 'react-router'

import InvoiceFormLayout from '../invoice-create/shared/invoice-form-layout'

export default function InvoiceEdit() {
  const { id } = useParams()
  const { contact, currencyData, deal, invoice, isInvoiceFetching, isInvoicePending, lineItems } =
    useInvoice(Number(id))
  const { clearStore, setInvoiceData } = useInvoiceCreateStoreActions()
  const {
    clearStore: clearLineItemsStore,
    setGrossDiscount,
    setGrossDiscountType,
    setLineItems,
    setTaxOption
  } = useLineItemsStoreActions()
  const [form] = Form.useForm()

  useEffect(() => {
    clearStore()
    clearLineItemsStore()
  }, [clearStore, clearLineItemsStore])

  useEffect(() => {
    if (!invoice || isInvoicePending || isInvoiceFetching) return

    setTaxOption(invoice.tax_option as TaxOption)
    setLineItems(lineItems)
    setGrossDiscount(invoice.gross_discount_amount ?? 0)
    setGrossDiscountType(invoice.gross_discount_type)
    setInvoiceData({
      bottomSectionNotes: invoice.bottom_section_notes,
      contactInformation: contact,
      currencyData,
      dealInformation: deal ? { ...deal, isDealSelected: true } : undefined,
      invoiceLineItems: lineItems,
      invoiceNumber: invoice.id,
      topSectionNotes: invoice.top_section_notes
    })
    form.setFieldsValue({
      dueDate: dayjs(invoice.due_date),
      invoiceDate: dayjs(invoice.invoice_date),
      invoicePrefix: invoice.invoice_prefix,
      invoiceTerm: invoice.term_key
    })
  }, [
    form,
    invoice,
    isInvoicePending,
    isInvoiceFetching,
    contact,
    currencyData,
    deal,
    lineItems,
    setLineItems,
    setInvoiceData,
    setTaxOption,
    setGrossDiscount,
    setGrossDiscountType
  ])

  if (isInvoicePending || isInvoiceFetching) return <InvoiceSkeleton />

  return (
    <InvoiceFormLayout form={form} mode="edit">
      <InvoiceForm form={form} mode="edit" />
    </InvoiceFormLayout>
  )
}
