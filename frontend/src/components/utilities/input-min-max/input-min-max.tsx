import { __ } from '@common/helpers/i18nWrap'
import { NUMBER_MAX_VALUE, NUMBER_MIN_VALUE } from '@features/form-builder/shared/constants'
import { Form, InputNumber } from 'antd'

import { createMinMaxValidator } from './shared/helpers'
import { type InputMinMaxProps } from './shared/types'

export default function InputMinMax({
  form,
  maxLabel = __('Maximum'),
  maxName = 'max',
  minLabel = __('Minimum'),
  minName = 'min'
}: InputMinMaxProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Form.Item
        className="mb-0"
        dependencies={[maxName]}
        initialValue={undefined}
        label={minLabel}
        name={minName}
        rules={[
          {
            validator: createMinMaxValidator(form, maxName, 'min')
          }
        ]}
      >
        <InputNumber
          className="w-full"
          max={NUMBER_MAX_VALUE}
          min={NUMBER_MIN_VALUE}
          placeholder={__('Minimum value')}
        />
      </Form.Item>
      <Form.Item
        className="mb-0"
        dependencies={[minName]}
        initialValue={undefined}
        label={maxLabel}
        name={maxName}
        rules={[
          {
            validator: createMinMaxValidator(form, minName, 'max')
          }
        ]}
      >
        <InputNumber
          className="w-full"
          max={NUMBER_MAX_VALUE}
          min={NUMBER_MIN_VALUE}
          placeholder={__('Maximum value')}
        />
      </Form.Item>
    </div>
  )
}
