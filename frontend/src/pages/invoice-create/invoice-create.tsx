import { $appConfig } from '@common/globalStates'
import { useLineItemsStoreActions } from '@features/product-line-items/state/use-line-items-store'
import usePrefix from '@pages/invoice-settings/internal/prefix/data/use-prefix'
import InvoiceSkeleton from '@utilities/invoice-skeleton/invoice-skeleton'
import { Form } from 'antd'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'

import InvoiceFormLayout from './shared/invoice-form-layout'
import { useDealInformationSelect, useInvoiceCreateStoreActions } from './state/use-invoice-create-store'
import InvoiceForm from './ui/invoice-form'

export default function InvoiceCreate() {
  const [form] = Form.useForm()
  const { clearStore, setCurrencyData } = useInvoiceCreateStoreActions()
  const { clearStore: clearLineItemsStore } = useLineItemsStoreActions()
  const { isPrefixPending, prefix } = usePrefix()
  const { homeCurrencyData } = useAtomValue($appConfig)
  const isDealSelected = useDealInformationSelect().isDealSelected

  useEffect(() => {
    clearStore()
    clearLineItemsStore()
  }, [clearStore, clearLineItemsStore])

  useEffect(() => {
    if (!isDealSelected) {
      setCurrencyData(homeCurrencyData)
    }
    if (prefix) {
      form.setFieldValue('invoicePrefix', prefix)
    }
  }, [form, prefix, setCurrencyData, homeCurrencyData, isDealSelected])

  if (isPrefixPending) {
    return <InvoiceSkeleton />
  }

  return (
    <InvoiceFormLayout form={form} mode="create">
      <InvoiceForm form={form} mode="create" />
    </InvoiceFormLayout>
  )
}
