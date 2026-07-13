import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Select, Typography } from 'antd'

import { FILTER_OPERATORS } from '../shared/constants'
import { type FilterField, type FilterInputProps } from '../shared/types'

const getOptions = (fields: FilterField[]) => {
  return fields.map(field => ({
    label: field.label,
    value: field.value
  }))
}

export default function FilterSelectInput({
  error,
  filter,
  filterableFields,
  onUpdate
}: FilterInputProps) {
  const handleFieldChange = (value: string) => {
    const field = filterableFields.find(f => f.value === value)
    const defaultOperator = field
      ? FILTER_OPERATORS[field.formatted_type]?.[0]?.value || 'is_not_empty'
      : 'is_not_empty'
    onUpdate({
      field_key: value,
      field_type: field?.formatted_type,
      is_custom: field?.is_custom || false,
      operator: defaultOperator,
      value: undefined
    })
  }

  return (
    <>
      <Select
        className="w-full"
        onChange={handleFieldChange}
        options={getOptions(filterableFields)}
        placeholder={__('Select field')}
        showSearch
        status={error ? 'error' : undefined}
        value={filter.field_key}
      />
      <If conditions={error}>
        <Typography.Text className="text-xs" type="danger">
          {error}
        </Typography.Text>
      </If>
    </>
  )
}
