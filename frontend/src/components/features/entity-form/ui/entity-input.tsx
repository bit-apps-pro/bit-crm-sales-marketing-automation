import { MODULES } from '@common/constants/modules'
import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import LookupFieldSelect from '@features/lookup-field-select'
import LookupField from '@utilities/lookup-field'
import { Checkbox, DatePicker, Divider, Form, Input, InputNumber, Radio, Select } from 'antd'
import { LuPercent } from 'react-icons/lu'

import { MAX_ALLOWED_AMOUNT, MAX_ALLOWED_PERCENTAGE } from '../shared/constants'
import { getValidationRules } from '../shared/entity-form-helpers'
import { type EntityInputPropsType } from '../shared/entity-form-types'

export default function EntityInput({
  currencyData,
  enableQuickCreate = true,
  field,
  formItemClassName = '',
  specialComponents
}: EntityInputPropsType) {
  const {
    default_value: defaultValue,
    field_key: fieldKey,
    help_text: helpText,
    label,
    max,
    min,
    name,
    options,
    related_module: relatedModule = '',
    required,
    source_module: sourceModule = '',
    status,
    tooltip,
    type
  } = field ?? {}

  if (type === 'section') {
    return (
      <Divider className="mb-0 mt-4 first:mt-0" key={fieldKey} orientation="left" orientationMargin="0">
        {__(label)}
      </Divider>
    )
  }

  const disabled = status === undefined ? false : !status

  const renderInput = () => {
    if (specialComponents?.[fieldKey]) {
      return specialComponents[fieldKey]
    }

    switch (type) {
      case 'checkbox': {
        return <Checkbox.Group disabled={disabled} name={name || fieldKey} options={options} />
      }

      case 'currency': {
        return (
          <InputNumber
            className="w-full"
            disabled={disabled}
            max={MAX_ALLOWED_AMOUNT}
            min={0}
            name={fieldKey}
            prefix={currencyData?.symbol}
          />
        )
      }

      case 'date': {
        return <DatePicker className="w-full" disabled={disabled} name={name || fieldKey} />
      }

      case 'lookup_autocomplete': {
        return <LookupField disabled={disabled} relatedModule={relatedModule} />
      }

      case 'lookup_select': {
        return (
          <LookupFieldSelect
            disabled={disabled}
            fieldKey={fieldKey}
            queryParams={
              relatedModule === MODULES.USER ? { role_filter: config.PLUGIN_SLUG } : undefined
            }
            relatedModule={relatedModule}
            showAddNew={enableQuickCreate}
            sourceModule={sourceModule}
          />
        )
      }

      case 'multi-select':
      case 'select': {
        return (
          <Select
            disabled={disabled}
            mode={type === 'select' ? undefined : 'multiple'}
            options={options}
          />
        )
      }

      case 'number': {
        return (
          <InputNumber
            className="w-full"
            disabled={disabled}
            max={max}
            min={min}
            placeholder={__('Enter number')}
          />
        )
      }

      case 'percentage': {
        return (
          <InputNumber
            className="w-full"
            disabled={disabled}
            max={MAX_ALLOWED_PERCENTAGE}
            min={0}
            name={fieldKey}
            suffix={<LuPercent />}
          />
        )
      }

      case 'radio': {
        return <Radio.Group disabled={disabled} name={name || fieldKey} options={options} />
      }

      case 'textarea': {
        return <Input.TextArea disabled={disabled} name={name || fieldKey} />
      }

      default: {
        return <Input disabled={disabled} name={fieldKey} type={type} />
      }
    }
  }

  return (
    <Form.Item
      className={cn(['mb-0', formItemClassName])}
      help={helpText}
      initialValue={defaultValue}
      key={fieldKey}
      label={label}
      name={fieldKey}
      required={required}
      rules={getValidationRules(label, type, required)}
      tooltip={tooltip}
    >
      {renderInput()}
    </Form.Item>
  )
}
