import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'

import useDealEdit from '../data/use-deal-edit'
import useUpdateDealStage from '../data/use-update-deal-stage'
import { useDealsKanbanActionsStore } from '../state/use-deals-kanban-store'
import {
  useIsUpdateModalOpenStore,
  useUpdateDealStageActionsStore,
  useUpdateDealStagePayloadStore
} from '../state/use-update-deal-stage-store'
import UpdateDealStageForm from './update-deal-stage-form'

export default function UpdateDealStageModal() {
  const { handleModal } = useUpdateDealStageActionsStore()
  const isOpen = useIsUpdateModalOpenStore()
  const payload = useUpdateDealStagePayloadStore()

  const { isUpdatingStage, updateDealStage } = useUpdateDealStage()
  const { moveDealToPosition, updateDeal } = useDealsKanbanActionsStore()
  const { dealCurrencyData, dealEditData, hasLineItems } = useDealEdit(Number(payload?.deal.id) || 0)

  const [form] = Form.useForm()

  const handleClose = () => {
    handleModal(false)
    form.resetFields()
    if (payload?.deal?.id) {
      moveDealToPosition(String(payload?.deal?.id), payload?.oldStageKey, payload?.oldPosition)
    }
  }

  const handleSubmit = async () => {
    if (!payload || !dealCurrencyData) return

    const values = await form.validateFields()
    const { deal, newStage, oldPosition, oldStageKey } = payload

    const dealAmount = Number(values?.amount || 0)
    const exchangeRate = Number(dealCurrencyData.exchange_rate || 1)
    const homeCurrencyAmount = dealAmount / exchangeRate

    updateDeal(deal.id, {
      closed_at: values?.closed_at?.format('YYYY-MM-DD HH:mm:ss'),
      ...(!hasLineItems && {
        amount: dealAmount,
        home_currency_amount: homeCurrencyAmount
      })
    })

    try {
      await updateDealStage({
        ...(!hasLineItems && { amount: String(dealAmount) }),
        closed_at: values?.closed_at,
        id: Number(deal.id),
        probability: newStage.probability,
        stage: values?.stage
      })
    } catch {
      moveDealToPosition(String(deal.id), oldStageKey, oldPosition)
    }

    handleModal(false)
    form.resetFields()
  }

  const initialValues = useMemo(
    () => ({
      amount: dealEditData?.amount,
      closed_at: dealEditData?.closed_at ? dayjs(dealEditData.closed_at) : dayjs(new Date()),
      stage: payload?.newStage.key
    }),
    [dealEditData?.amount, dealEditData?.closed_at, payload?.newStage.key]
  )

  useEffect(() => {
    if (payload) {
      form.setFieldsValue(initialValues)
    }
  }, [form, payload, initialValues])

  return (
    <Modal
      cancelButtonProps={{ className: 'rounded-full' }}
      centered
      confirmLoading={false}
      destroyOnHidden
      loading={isUpdatingStage}
      okButtonProps={{ className: 'rounded-full', disabled: false }}
      okText={__('Update')}
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
      title={__('Update Deal Stage')}
    >
      <If conditions={isOpen && payload}>
        <UpdateDealStageForm
          currencySymbol={dealCurrencyData?.symbol}
          form={form}
          isAmountDisabled={hasLineItems}
          stage={payload?.newStage}
        />
      </If>
    </Modal>
  )
}
