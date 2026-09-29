import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { DATE_FORMAT } from '@config/date-format'
import { formatInvoiceAmount } from '@pages/Invoice/shared/invoice-payment-status'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import { Alert, DatePicker, Form, Input, Modal, Skeleton } from 'antd'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'

import useInvoice from '../data/use-invoice'
import useInvoicePayments from '../data/use-invoice-payments'
import useRecordManualPayment from '../data/use-record-manual-payment'
import { SummaryItem } from './invoice-payments-panel/internal/payment-summary'

interface ManualPaymentFormValues {
  note?: string
  paid_at: dayjs.Dayjs
  reference?: string
}

export default function MarkAsPaidModal({
  invoiceId,
  onClose,
  open
}: {
  invoiceId: number
  onClose: () => void
  open: boolean
}) {
  const [form] = Form.useForm<ManualPaymentFormValues>()
  const { homeCurrencyData } = useAtomValue($appConfig)
  // An invoice can be billed in a currency other than the store's.
  const { currencyData = homeCurrencyData } = useInvoice(invoiceId)
  const { isPaymentsLoading, summary } = useInvoicePayments(invoiceId)
  const { isRecordingManualPayment, recordManualPayment } = useRecordManualPayment()

  const dueAmount = summary?.due ?? 0
  // A zero-total invoice owes nothing yet is not settled — it still has to be
  // recorded as paid, so only an invoice that actually took money is blocked.
  const isAlreadySettled = (summary?.total ?? 0) > 0 && dueAmount <= 0
  const hasNothingDue = !isPaymentsLoading && isAlreadySettled

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    await recordManualPayment({
      id: invoiceId,
      note: values.note || undefined,
      paid_at: values.paid_at,
      reference: values.reference || undefined
    })

    handleClose()
  }

  return (
    <Modal
      cancelButtonProps={{ className: 'rounded-full' }}
      confirmLoading={isRecordingManualPayment}
      destroyOnHidden
      okButtonProps={{ className: 'rounded-full', disabled: isPaymentsLoading || hasNothingDue }}
      okText={__('Record Payment')}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={open}
      title={__('Mark as Paid')}
    >
      <If conditions={isPaymentsLoading}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </If>

      <If conditions={hasNothingDue}>
        <Alert message={__('This invoice has nothing left to pay.')} showIcon type="info" />
      </If>

      <If conditions={!isPaymentsLoading && !hasNothingDue}>
        <p className="mb-4 text-sm text-slate-500">
          {__(
            'Records a payment you received outside the online checkout. It settles the invoice in full.'
          )}
        </p>

        <div className="mb-4">
          <SummaryItem
            label={__('Amount to record')}
            size="large"
            value={formatInvoiceAmount(currencyData, dueAmount)}
          />
        </div>

        <Form
          form={form}
          initialValues={{ paid_at: dayjs() }}
          layout="vertical"
          requiredMark={customizedRequiredMark}
        >
          <Form.Item
            label={__('Payment Date')}
            name="paid_at"
            rules={[{ message: __('Please select the payment date!'), required: true }]}
          >
            <DatePicker
              className="w-full"
              format={DATE_FORMAT}
              // Money cannot have arrived after it was recorded.
              maxDate={dayjs()}
            />
          </Form.Item>

          <Form.Item label={__('Reference')} name="reference">
            <Input placeholder={__('e.g. cheque number or transaction ID')} />
          </Form.Item>

          <Form.Item label={__('Note')} name="note">
            <Input.TextArea placeholder={__('Optional note about this payment')} rows={2} />
          </Form.Item>
        </Form>
      </If>
    </Modal>
  )
}
