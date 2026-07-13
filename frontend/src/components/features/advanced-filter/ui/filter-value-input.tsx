import { __ } from '@common/helpers/i18nWrap'
import LookupFieldSelect from '@features/lookup-field-select'
import If from '@utilities/If'
import { DatePicker, Input, Select, Typography } from 'antd'
import { type Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import { FILTER_OPERATORS_WITHOUT_VALUE } from '../shared/constants'
import { type FilterInputProps } from '../shared/types'

export default function FilterValueInput({
  error,
  filter,
  filterableFields,
  onUpdate
}: FilterInputProps) {
  const selectedField = filterableFields.find(f => f.value === filter.field_key)
  const fieldType = selectedField?.type

  const handleValueChange = (value: Dayjs | number | string | string[] | undefined) => {
    let processedValue: number | string | string[] | undefined

    if (value === undefined) {
      processedValue = undefined
    } else if (dayjs.isDayjs(value)) {
      processedValue = value.format('YYYY-MM-DD')
    } else {
      processedValue = value as number | string | string[]
    }

    onUpdate({ value: processedValue })
  }

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    const processedValue: string[] | undefined =
      !dates || !dates[0] || !dates[1]
        ? undefined
        : [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]

    onUpdate({ value: processedValue })
  }

  const renderValueInput = () => {
    switch (fieldType) {
      case 'date': {
        const isRangeOperator = ['between', 'not_between'].includes(filter.operator)

        if (isRangeOperator) {
          const rangeValue: [Dayjs | null, Dayjs | null] | undefined =
            Array.isArray(filter.value) && filter.value.length === 2
              ? [dayjs(filter.value[0] as string), dayjs(filter.value[1] as string)]
              : undefined

          return (
            <DatePicker.RangePicker
              className="w-full"
              onChange={handleRangeChange}
              placeholder={[__('Start date'), __('End date')]}
              status={error ? 'error' : undefined}
              value={rangeValue}
            />
          )
        }

        return (
          <DatePicker
            className="w-full"
            format="YYYY-MM-DD"
            onChange={handleValueChange}
            placeholder={__('Select date')}
            status={error ? 'error' : undefined}
            value={filter.value ? dayjs(filter.value as string) : undefined}
          />
        )
      }
      case 'lookup_autocomplete':
      case 'lookup_select': {
        return (
          <LookupFieldSelect
            className="w-full"
            onChange={handleValueChange}
            relatedModule={selectedField?.related_module || ''}
            showAddNew={false}
            status={error ? 'error' : undefined}
            value={filter.value as string}
          />
        )
      }
      case 'multi-select': {
        return (
          <Select
            allowClear
            className="w-full"
            mode="multiple"
            onChange={handleValueChange}
            options={selectedField?.options}
            placeholder={__('Select options')}
            showSearch
            status={error ? 'error' : undefined}
            value={filter.value as string[]}
          />
        )
      }
      case 'number': {
        return (
          <Input
            className="w-full"
            onChange={e => handleValueChange(e.target.value || undefined)}
            placeholder={__('Enter value')}
            status={error ? 'error' : undefined}
            type="number"
            value={filter.value ?? undefined}
          />
        )
      }
      case 'select': {
        return (
          <Select
            allowClear
            className="w-full"
            onChange={handleValueChange}
            options={selectedField?.options}
            placeholder={__('Select option')}
            showSearch
            status={error ? 'error' : undefined}
            value={filter.value as string}
          />
        )
      }
      default: {
        return (
          <Input
            onChange={e => handleValueChange(e.target.value)}
            placeholder={__('Enter value')}
            status={error ? 'error' : undefined}
            value={filter.value as string}
          />
        )
      }
    }
  }

  if (
    !fieldType ||
    FILTER_OPERATORS_WITHOUT_VALUE.includes(
      filter.operator as (typeof FILTER_OPERATORS_WITHOUT_VALUE)[number]
    )
  ) {
    return (
      <>
        <Input
          className="w-full"
          disabled
          placeholder={__('Value')}
          status={error ? 'error' : undefined}
        />
        <If conditions={error}>
          <Typography.Text className="text-xs" type="danger">
            {error}
          </Typography.Text>
        </If>
      </>
    )
  }

  return (
    <>
      {renderValueInput()}
      <If conditions={error}>
        <Typography.Text className="text-xs" type="danger">
          {error}
        </Typography.Text>
      </If>
    </>
  )
}
