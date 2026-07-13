import { __ } from '@common/helpers/i18nWrap'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { MAX_ALLOWED_AMOUNT } from '@pages/deal/shared/constants'
import { Checkbox, DatePicker, Input, InputNumber, Radio, Select } from 'antd'
import { LuDollarSign } from 'react-icons/lu'

interface DealFieldInputProps {
  field?: FieldItem
}

export default function DealFieldInput({ field, ...props }: DealFieldInputProps) {
  if (!field) {
    return <Input disabled placeholder={__('Select a field first')} />
  }

  switch (field.type) {
    case 'checkbox': {
      return <Checkbox.Group options={field.options} {...props} />
    }

    case 'currency': {
      return (
        <InputNumber
          className="w-full"
          max={MAX_ALLOWED_AMOUNT}
          min={0}
          prefix={<LuDollarSign size={14} />}
          {...props}
        />
      )
    }

    case 'date': {
      return <DatePicker className="w-full" {...props} />
    }

    case 'multi-select': {
      return (
        <Select
          allowClear
          mode="multiple"
          options={field.options}
          placeholder={__('Select options')}
          showSearch
          {...props}
        />
      )
    }

    case 'number': {
      return <InputNumber className="w-full" {...props} />
    }

    case 'radio': {
      return <Radio.Group options={field.options} {...props} />
    }

    case 'select': {
      return (
        <Select
          allowClear
          options={field.options}
          placeholder={__('Select an option')}
          showSearch
          {...props}
        />
      )
    }

    case 'textarea': {
      return <Input.TextArea rows={2} {...props} />
    }

    default: {
      return <Input type={field.type} {...props} />
    }
  }
}
