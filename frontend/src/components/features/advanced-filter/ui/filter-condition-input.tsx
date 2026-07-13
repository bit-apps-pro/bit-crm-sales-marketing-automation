import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Select, Typography } from 'antd'

import { FILTER_OPERATORS } from '../shared/constants'
import { type FilterInputProps } from '../shared/types'

export default function FilterConditionInput({
  error,
  filter,
  filterableFields,
  onUpdate
}: FilterInputProps) {
  const selectedField = filterableFields.find(f => f.value === filter.field_key)
  const fieldType = filter.field_type || selectedField?.formatted_type
  const availableOperators = fieldType ? FILTER_OPERATORS[fieldType] || [] : []

  return (
    <>
      <Select
        className="w-full"
        disabled={!selectedField}
        onChange={value => onUpdate({ operator: value })}
        options={availableOperators}
        placeholder={__('Select condition')}
        status={error ? 'error' : undefined}
        value={filter.operator}
      />
      <If conditions={error}>
        <Typography.Text className="text-xs" type="danger">
          {error}
        </Typography.Text>
      </If>
    </>
  )
}
