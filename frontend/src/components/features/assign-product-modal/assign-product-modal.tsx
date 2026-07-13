import { __ } from '@common/helpers/i18nWrap'
import ProductLineItems from '@features/product-line-items'
import { calculateGrandTotal } from '@features/product-line-items/shared/helpers'
import { type LineItem } from '@features/product-line-items/shared/types'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useLineItemsStoreActions,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import If from '@utilities/If'
import { Modal } from 'antd'
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

  const handleClose = () => {
    setIsModalOpen(false)
    setLocalLineItems([])
  }

  const handleSubmit = async () => {
    const validLineItems = localLineItems.filter(item => item.product_name)
    setLineItems(validLineItems)

    const grandTotalBeforeDiscount =
      validLineItems.length > 0 ? calculateGrandTotal(validLineItems, taxOption) : 0

    const discountAmount =
      grossDiscountType === 'amount' ? grossDiscount : (grandTotalBeforeDiscount * grossDiscount) / 100

    const grandTotal = Math.max(0, grandTotalBeforeDiscount - discountAmount)

    setAmount(grandTotal, form)

    await onSave?.(validLineItems, grandTotal)
    handleClose()
  }

  return (
    <Modal
      centered
      confirmLoading={loading}
      destroyOnHidden
      maskClosable={false}
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
        />
      </If>
    </Modal>
  )
}
