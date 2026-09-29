import { MODULES } from '@common/constants/modules'
import { renderFullAddress, renderFullName } from '@common/helpers/entity-helpers'
import { __ } from '@common/helpers/i18nWrap'
import LookupFieldSelect from '@features/lookup-field-select'
import { createEmptyLineItem, formatLineItems } from '@features/product-line-items/shared/helpers'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useLineItemsStoreActions,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import { Alert, Button, Modal, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import useDealContactCurrency from '../data/use-deal-contact-currency'
import {
  useContactInformationSelect,
  useDealInformationSelect,
  useInvoiceCreateStoreActions,
  useInvoiceLineItemsSelect
} from '../state/use-invoice-create-store'

export default function DealSelect({ mode }: { mode: string }) {
  const [searchParams] = useSearchParams()
  const [dealId, setDealId] = useState<number | string>(() =>
    mode === 'edit' ? '' : (searchParams.get('dealId') ?? '')
  )
  const { clearStore, setDealInformation, setInvoiceData } = useInvoiceCreateStoreActions()
  const {
    clearStore: clearLineItemsStore,
    setGrossDiscount,
    setGrossDiscountType,
    setLineItems,
    setTaxOption
  } = useLineItemsStoreActions()
  const {
    dealContactCurrency,
    isDealContactCurrencyError,
    isDealContactCurrencyFetching,
    refetchDealContactCurrency
  } = useDealContactCurrency(mode === 'create' ? Number(dealId) : 0)
  const [modal, contextHolder] = Modal.useModal()
  const appliedDealId = useRef<number | string>()
  const confirmingChange = useRef(false)
  const importedSnapshot = useRef('')
  const taxOption = useTaxOptionSelect()
  const grossDiscount = useGrossDiscountSelect()
  const grossDiscountType = useGrossDiscountTypeSelect()
  const dealInformation = useDealInformationSelect()
  const contactInformation = useContactInformationSelect()
  const invoiceLineItems = useInvoiceLineItemsSelect()

  useEffect(() => {
    if (
      mode !== 'create' ||
      !dealId ||
      !dealContactCurrency ||
      isDealContactCurrencyFetching ||
      isDealContactCurrencyError ||
      String(appliedDealId.current) === String(dealId)
    )
      return
    const { contact, currencyData, deal, lineItems } = dealContactCurrency.data
    if (String(deal.id) !== String(dealId)) return

    // Give the invoice its own rows; never carry over the deal's persisted row IDs.
    const invoiceItems = lineItems.map(item => ({
      ...item,
      entity_id: undefined,
      id: createEmptyLineItem().id,
      module: undefined
    }))
    importedSnapshot.current = JSON.stringify([
      formatLineItems(invoiceItems),
      deal.tax_option || 'exclusive',
      Number(deal.gross_discount_amount) || 0,
      deal.gross_discount_type || 'amount'
    ])
    appliedDealId.current = dealId
    setTaxOption(deal.tax_option || 'exclusive')
    setGrossDiscount(Number(deal.gross_discount_amount) || 0)
    setGrossDiscountType(deal.gross_discount_type || 'amount')
    setLineItems(invoiceItems)
    setInvoiceData({
      contactInformation: contact,
      currencyData,
      dealInformation: { ...deal, isDealSelected: true },
      invoiceLineItems: invoiceItems
    })
  }, [
    dealContactCurrency,
    dealId,
    isDealContactCurrencyError,
    isDealContactCurrencyFetching,
    mode,
    setGrossDiscount,
    setGrossDiscountType,
    setInvoiceData,
    setLineItems,
    setTaxOption
  ])

  const handleDealChange = (nextDealId: number | string = '') => {
    if (mode !== 'create' || String(nextDealId) === String(dealId) || confirmingChange.current) return

    const changeDeal = () => {
      appliedDealId.current = undefined
      setDealId(nextDealId)
      if (nextDealId) {
        setDealInformation({ ...dealInformation, isDealSelected: false })
      } else {
        clearStore()
        clearLineItemsStore()
        importedSnapshot.current = ''
      }
    }

    const hasUnnamedEdits = invoiceLineItems.some(
      item =>
        !item.product_name &&
        (item.description ||
          Number(item.unit_price_in_deal_currency) ||
          item.quantity !== 1 ||
          item.discount_percentage ||
          item.tax_rate)
    )
    const currentSnapshot = JSON.stringify([
      formatLineItems(invoiceLineItems),
      taxOption,
      grossDiscount,
      grossDiscountType
    ])
    if (hasUnnamedEdits || (importedSnapshot.current && currentSnapshot !== importedSnapshot.current)) {
      confirmingChange.current = true
      modal.confirm({
        content: __(
          'Changing the deal will replace the invoice line items, taxes, and discounts. Any edits to these will be lost.'
        ),
        onCancel: () => {
          confirmingChange.current = false
        },
        onOk: () => {
          confirmingChange.current = false
          changeDeal()
        },
        title: __('Replace invoice line items?')
      })
    } else {
      changeDeal()
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4 rounded-lg border border-solid border-[#EBEAFF] p-5 dark:border-neutral-700 dark:bg-neutral-900">
      {contextHolder}
      <div className="flex items-start justify-between gap-10">
        <Typography.Text className="flex h-10 items-center whitespace-nowrap" strong>
          {__('Select a deal')}
        </Typography.Text>
        <div className="min-w-0 flex-1 pb-6">
          <LookupFieldSelect
            className="w-full"
            disabled={mode === 'edit'}
            onChange={handleDealChange}
            relatedModule={MODULES.DEAL}
            showAddNew={false}
            value={mode === 'edit' ? dealInformation.id : dealId || undefined}
          />
        </div>
      </div>
      {isDealContactCurrencyError && (
        <Alert
          action={<Button onClick={() => refetchDealContactCurrency()}>{__('Retry')}</Button>}
          message={__('Unable to load the selected deal. Please try again.')}
          showIcon
          type="error"
        />
      )}
      {dealInformation.isDealSelected ? (
        <div className="flex-1 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:bg-neutral-900">
          <div>
            <Typography.Text className="text-xs text-gray-500">
              {__('Contact Information')}
            </Typography.Text>
          </div>
          <div className="space-y-1">
            <Typography.Text className="block" strong>
              {renderFullName(
                contactInformation?.title,
                contactInformation?.first_name,
                contactInformation?.last_name
              )}
            </Typography.Text>
            <Typography.Text className="block">{dealInformation?.email}</Typography.Text>
            <Typography.Text>
              {renderFullAddress(
                contactInformation?.billing_address_line_1,
                contactInformation?.billing_address_line_2,
                contactInformation?.billing_city,
                contactInformation?.billing_county,
                contactInformation?.billing_state,
                contactInformation?.billing_zip,
                contactInformation?.billing_country
              )}
            </Typography.Text>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <Link target="_blank" to="/deals/create">
            <Button
              className="h-full w-full py-12"
              icon={<LuPlus size={16} />}
              size="large"
              type="dashed"
            >
              {__('Create New Deal')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
