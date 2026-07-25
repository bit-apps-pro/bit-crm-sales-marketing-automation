import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { formatLineItems } from '@features/product-line-items/shared/helpers'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useLineItemsStoreActions,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import useBusinessSettings from '@pages/general-settings/internal/business-settings/data/use-business-settings'
import useUpdateInvoice from '@pages/invoice-edit/data/use-update-invoice'
import If from '@utilities/If'
import { Button, type FormInstance } from 'antd'
import { useContext, useRef } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useNavigate } from 'react-router'

import useStoreInvoice from '../data/use-store-invoice'
import { type InvoiceFormType } from '../shared/invoice-create-types'
import {
  useDealInformationSelect,
  useInvoiceBottomSectionNotesSelect,
  useInvoiceCreateStoreActions,
  useInvoiceLineItemsSelect,
  useInvoiceNumberSelect,
  useInvoiceTopSectionNotesSelect
} from '../state/use-invoice-create-store'

interface InvoiceSubmitButtonProps {
  form: FormInstance<InvoiceFormType>
  mode: 'create' | 'edit'
}

export default function InvoiceSubmitButton({ form, mode }: InvoiceSubmitButtonProps) {
  const navigate = useNavigate()
  const { messageApi } = useContext(NotifyContext)

  const { isStorePending, storeInvoice } = useStoreInvoice()
  const { isUpdatePending, updateInvoice } = useUpdateInvoice()
  const { businessSettings } = useBusinessSettings()
  const topSectionNotes = useInvoiceTopSectionNotesSelect()
  const bottomSectionNotes = useInvoiceBottomSectionNotesSelect()
  const lineItems = useInvoiceLineItemsSelect()
  const dealInformation = useDealInformationSelect()
  const taxOption = useTaxOptionSelect()
  const grossDiscount = useGrossDiscountSelect()
  const grossDiscountType = useGrossDiscountTypeSelect()
  const { clearStore } = useInvoiceCreateStoreActions()
  const { clearStore: clearLineItemsStore } = useLineItemsStoreActions()
  const invoiceId = useInvoiceNumberSelect()

  const pendingWithPreview = useRef(false)

  const validateInvoiceData = (): { errorMessage?: string; isValid: boolean } => {
    if (formatLineItems(lineItems).length === 0) {
      return {
        errorMessage: __('Please add at least one line item to proceed.'),
        isValid: false
      }
    }

    if (!businessSettings) {
      return {
        errorMessage: __(
          'Business settings are not configured. Please set up your business information in Settings before creating an invoice.'
        ),
        isValid: false
      }
    }

    return { isValid: true }
  }

  const handleSubmitForm = async (withPreview: boolean) => {
    const validation = validateInvoiceData()
    if (!validation.isValid) {
      messageApi?.error(validation.errorMessage)
      return
    }

    pendingWithPreview.current = withPreview

    try {
      const formData = await form.validateFields()
      const invoicePrefix = formData.invoicePrefix
      const invoiceDate = formData.invoiceDate
      const dueDate = formData.dueDate
      const termKey = formData.invoiceTerm

      const data = {
        bottom_section_notes: bottomSectionNotes,
        currency: dealInformation.currency,
        due_date: dueDate,
        entity_id: Number(dealInformation.id),
        gross_discount_amount: grossDiscount,
        gross_discount_type: grossDiscountType,
        invoice_date: invoiceDate,
        invoice_prefix: invoicePrefix,
        line_items: formatLineItems(lineItems),
        module: MODULES.DEAL,
        tax_option: taxOption,
        term_key: termKey,
        top_section_notes: topSectionNotes
      }

      if (mode === 'create') {
        const response = await storeInvoice(data)
        if (response.data?.id) {
          form.resetFields()
          clearStore()
          clearLineItemsStore()
          navigate(withPreview ? `/invoices/details/${response.data.id}` : '/invoices')
        }
      } else if (mode === 'edit') {
        const response = await updateInvoice({ id: Number(invoiceId), ...data })
        if (response.code === 'SUCCESS') {
          form.resetFields()
          clearStore()
          clearLineItemsStore()
          navigate(withPreview ? `/invoices/details/${invoiceId}` : '/invoices')
        }
      }
    } catch (error) {
      console.error('Invoice submission error:', error)
    }
  }

  const isPending = mode === 'create' ? isStorePending : isUpdatePending

  return (
    <If
      conditions={checkCapability(
        mode === 'create' ? CAPABILITIES.INVOICE.CREATE : CAPABILITIES.INVOICE.UPDATE
      )}
    >
      <div className="flex gap-2">
        <If conditions={mode === 'edit'}>
          <Button
            className="rounded-full"
            loading={isPending && !pendingWithPreview.current}
            onClick={() => handleSubmitForm(false)}
            size="large"
          >
            {__('Update')}
          </Button>
        </If>
        <Button
          className="rounded-full"
          icon={<LuPlus />}
          loading={isPending && pendingWithPreview.current}
          onClick={() => handleSubmitForm(true)}
          size="large"
          type="primary"
        >
          {mode === 'create' ? __('Create & Preview') : __('Update & Preview')}
        </Button>
      </div>
    </If>
  )
}
