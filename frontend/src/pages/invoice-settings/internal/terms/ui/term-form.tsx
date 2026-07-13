import { __ } from '@common/helpers/i18nWrap'
import customizedRequiredMark from '@utilities/customized-required-mark'
import { type FormInstance, Input, InputNumber } from 'antd'
import { Form } from 'antd'

interface TermFormProps {
  form: FormInstance
}

export default function TermForm({ form }: TermFormProps) {
  return (
    <Form form={form} layout="vertical" requiredMark={customizedRequiredMark}>
      <Form.Item
        label={__('Term Name')}
        name="name"
        rules={[{ message: __('Please enter the term name'), required: true }]}
      >
        <Input placeholder={__('Net')} />
      </Form.Item>
      <Form.Item
        label={__('Number of Days')}
        name="days"
        rules={[{ message: __('Please enter the number of days'), required: true }]}
      >
        <InputNumber className="w-full" min={0} />
      </Form.Item>
    </Form>
  )
}
