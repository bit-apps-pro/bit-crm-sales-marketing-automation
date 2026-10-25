import { __ } from '@common/helpers/i18nWrap'
import ProductLineItems from '@features/product-line-items'
import { TAX_RULES_MUTATION_KEY } from '@features/product-line-items/shared/constants'
import { calculateTotals } from '@features/product-line-items/shared/helpers'
import { type LineItem } from '@features/product-line-items/shared/types'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useLineItemsSelect,
  useLineItemsStoreActions,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import LineItemTaxRules from '@features/product-line-items/ui/line-item-tax-rules'
import { useIsMutating } from '@tanstack/react-query'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { useState } from 'react'

import { type AssignProductModalProps } from './shared/types'
import {
  useAssignProductModalStoreActions,
  useIsAssignProductModalOpenSelect
} from './state/use-assign-product-modal-store'

export default function AssignProductModal({
  currencyData,
  form,
  loading,
  onSave
}: AssignProductModalProps) {
  const isOpen = useIsAssignProductModalOpenSelect()
  const { setIsModalOpen } = useAssignProductModalStoreActions()
  const taxOption = useTaxOptionSelect()
  const { setAmount, setLineItems } = useLineItemsStoreActions()
  const grossDiscount = useGrossDiscountSelect()
  const grossDiscountType = useGrossDiscountTypeSelect()

  const [localLineItems, setLocalLineItems] = useState<LineItem[]>([])
  const storedLineItems = useLineItemsSelect()
  const contactId = Form.useWatch('contact_id', { form, preserve: true })
  const isApplyingTaxRules = useIsMutating({ mutationKey: TAX_RULES_MUTATION_KEY }) > 0

  const handleClose = () => {
    setIsModalOpen(false)
    setLocalLineItems([])
  }

  const storeLineItems = (validLineItems: LineItem[]) => {
    setLineItems(validLineItems)

    const { grandTotal } = calculateTotals(
      validLineItems,
      taxOption,
      grossDiscount,
      grossDiscountType,
      currencyData?.decimal_places
    )

    setAmount(grandTotal, form)

    return grandTotal
  }

  const handleSubmit = async () => {
    const validLineItems = localLineItems.filter(item => item.product_name)
    const grandTotal = storeLineItems(validLineItems)

    await onSave?.(validLineItems, grandTotal)
    handleClose()
  }

  return (
    <>
      <If conditions={!isOpen && !onSave && storedLineItems.length > 0}>
        <div hidden>
          <LineItemTaxRules
            localLineItems={storedLineItems}
            setLocalLineItems={updater => {
              storeLineItems(typeof updater === 'function' ? updater(storedLineItems) : updater)
            }}
            taxContactId={contactId}
          />
        </div>
      </If>
      <Modal
        centered
        confirmLoading={loading}
        destroyOnHidden
        maskClosable={false}
        okButtonProps={{ disabled: isApplyingTaxRules }}
        okText={__('Save')}
        onCancel={handleClose}
        onOk={handleSubmit}
        open={isOpen}
        styles={{
          body: {
            marginInline: '-22px',
            maxHeight: '70vh',
            overflowY: 'auto',
            paddingInline: '22px'
          }
        }}
        title={__('Add Products to Deal')}
        width={1200}
      >
        <If conditions={isOpen}>
          <ProductLineItems
            currencyData={currencyData}
            localLineItems={localLineItems}
            setLocalLineItems={setLocalLineItems}
            taxContactId={contactId}
          />
        </If>
      </Modal>
    </>
  )
}
