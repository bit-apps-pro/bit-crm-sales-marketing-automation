import If from '@utilities/If'
import { Button } from 'antd'
import { LuTrash2 } from 'react-icons/lu'

import { type AdvancedFilterItemProps } from '../shared/types'
import FilterConditionInput from './filter-condition-input'
import FilterSelectInput from './filter-select-input'
import FilterValueInput from './filter-value-input'

export default function AdvancedFilterItem({
  errors,
  filter,
  filterableFields,
  onRemove,
  onUpdate,
  shouldShowRemoveButton
}: AdvancedFilterItemProps) {
  return (
    <div className="flex items-start space-x-2">
      <div className="flex-1">
        <FilterSelectInput
          error={errors?.field_key || false}
          filter={filter}
          filterableFields={filterableFields}
          onUpdate={onUpdate}
        />
      </div>
      <div className="flex-1">
        <FilterConditionInput
          error={errors?.operator || false}
          filter={filter}
          filterableFields={filterableFields}
          onUpdate={onUpdate}
        />
      </div>
      <div className="flex-1">
        <FilterValueInput
          error={errors?.value || false}
          filter={filter}
          filterableFields={filterableFields}
          onUpdate={onUpdate}
        />
      </div>
      <If conditions={shouldShowRemoveButton}>
        <Button
          className="self-center"
          icon={<LuTrash2 color="red" />}
          onClick={onRemove}
          size="small"
          type="text"
        />
      </If>
    </div>
  )
}
