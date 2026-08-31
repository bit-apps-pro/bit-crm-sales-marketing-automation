import { $appConfig } from '@common/globalStates'
import { useLineItemsStoreActions } from '@features/product-line-items/state/use-line-items-store'
import useBusinessSettings from '@pages/general-settings/internal/business-settings/data/use-business-settings'
import usePrefix from '@pages/invoice-settings/internal/prefix/data/use-prefix'
import InvoiceFormSkeleton from '@utilities/invoice-skeleton/invoice-form-skeleton'
import { Form } from 'antd'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'

import InvoiceFormLayout from './shared/invoice-form-layout'
import { useDealInformationSelect, useInvoiceCreateStoreActions } from './state/use-invoice-create-store'
import InvoiceForm from './ui/invoice-form'

export default function InvoiceCreate() {
  const [form] = Form.useForm()
  const { clearStore, setCurrencyData } = useInvoiceCreateStoreActions()
  const { clearStore: clearLineItemsStore } = useLineItemsStoreActions()
  const { isPrefixLoading, prefix } = usePrefix()
  const { isBusinessSettingsLoading } = useBusinessSettings()
  const { homeCurrencyData } = useAtomValue($appConfig)
  const isDealSelected = useDealInformationSelect().isDealSelected

  const isInvoiceFormLoading = isBusinessSettingsLoading || isPrefixLoading

  useEffect(
    () => () => {
      clearStore()
      clearLineItemsStore()
    },
    [clearStore, clearLineItemsStore]
  )

  useEffect(() => {
    if (!isDealSelected) {
      setCurrencyData(homeCurrencyData)
    }
  }, [setCurrencyData, homeCurrencyData, isDealSelected])

  useEffect(() => {
    if (isInvoiceFormLoading) return
    if (!form.isFieldTouched('invoiceDate')) {
      form.setFieldValue('invoiceDate', dayjs())
    }
    if (!form.isFieldTouched('invoicePrefix')) {
      form.setFieldValue('invoicePrefix', prefix)
    }
  }, [form, isInvoiceFormLoading, prefix])
  return (
    <InvoiceFormLayout form={form} isLoading={isInvoiceFormLoading} mode="create">
      {isInvoiceFormLoading ? <InvoiceFormSkeleton /> : <InvoiceForm form={form} mode="create" />}
    </InvoiceFormLayout>
  )
}
