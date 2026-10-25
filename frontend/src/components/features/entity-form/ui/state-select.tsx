import { __ } from '@common/helpers/i18nWrap'
import useStates from '@common/hooks/use-states'
import { Form, Input, Select } from 'antd'

import { type StateSelectPropsType } from '../shared/entity-form-types'

export default function StateSelect({
  countryField,
  disabled,
  id,
  name,
  onChange,
  value
}: StateSelectPropsType) {
  const form = Form.useFormInstance()
  const country = Form.useWatch(countryField, { form, preserve: true })
  const { getStateOptions, isStatesLoading } = useStates(country)
  const options = getStateOptions(country)

  if (!country) {
    return (
      <Input disabled id={id} name={name} placeholder={__('Select a country first')} value={value} />
    )
  }

  if (options.length === 0 && !isStatesLoading) {
    return (
      <Input
        disabled={disabled}
        id={id}
        name={name}
        onChange={e => onChange?.(e.target.value)}
        value={value}
      />
    )
  }

  return (
    <Select
      allowClear
      disabled={disabled}
      id={id}
      loading={isStatesLoading}
      onChange={onChange}
      optionFilterProp="label"
      options={options}
      showSearch
      value={value || undefined}
    />
  )
}
