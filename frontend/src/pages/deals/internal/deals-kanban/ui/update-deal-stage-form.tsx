import { __ } from '@common/helpers/i18nWrap'
import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'
import { MAX_ALLOWED_AMOUNT } from '@pages/deal/shared/constants'
import { DatePicker, type FormInstance, InputNumber, Select } from 'antd'
import { Form } from 'antd'
import dayjs from 'dayjs'

export default function UpdateDealStageForm({
  createdAt,
  currencySymbol,
  form,
  isAmountDisabled,
  stage
}: {
  createdAt?: string
  currencySymbol?: string
  form: FormInstance
  isAmountDisabled?: boolean
  stage?: Stage
}) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item label={__('Amount')} name="amount">
        <InputNumber
          className="w-full"
          disabled={isAmountDisabled}
          max={MAX_ALLOWED_AMOUNT}
          placeholder={__('Input amount')}
          prefix={currencySymbol}
        />
      </Form.Item>
      <Form.Item
        label={__('Closing Date')}
        name="closed_at"
        rules={[{ message: __('Please input Closing Date!'), required: true }]}
      >
        <DatePicker
          className="w-full"
          format={'YYYY-MM-DD hh:mm A'}
          minDate={createdAt ? dayjs(createdAt).startOf('day') : undefined}
          placeholder={__('Select date and time')}
          showTime={{ defaultValue: dayjs('12:00', 'hh:mm') }}
        />
      </Form.Item>
      <Form.Item
        label={__('Stage')}
        name="stage"
        rules={[{ message: __('Please select Stage!'), required: true }]}
      >
        <Select
          className="rounded"
          disabled
          prefix={<div className="size-4 rounded-full" style={{ backgroundColor: stage?.color }} />}
          style={{
            border: '1px solid',
            borderColor: stage?.color
          }}
        />
      </Form.Item>
    </Form>
  )
}
