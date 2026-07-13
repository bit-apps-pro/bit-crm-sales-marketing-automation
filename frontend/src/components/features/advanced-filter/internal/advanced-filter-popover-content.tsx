import { __ } from '@common/helpers/i18nWrap'
import { type BaseFieldItemType } from '@features/entity-form/shared/entity-form-types'
import { Button, Divider } from 'antd'
import { create } from 'mutative'
import { useEffect, useMemo } from 'react'
import { LuPlus } from 'react-icons/lu'

import { getFilterableFields, getFilterItemErrors } from '../shared/common-functions'
import { FILTER_OPERATORS_WITHOUT_VALUE, NEW_FILTER } from '../shared/constants'
import { type FilterCondition, type FilterField } from '../shared/types'
import { useAdvanceFilterActions } from '../state/use-advance-filter-persist-store'
import {
  useAdvancedFilterActions,
  useFilterGroups,
  useGroupErrors
} from '../state/use-advanced-filter-store'
import AdvancedFilterItem from '../ui/advanced-filter-item'

interface AdvancedFilterPopoverContentProps<T extends BaseFieldItemType> {
  fields: T[]
  module: string
  moduleActiveFilters: FilterCondition[][]
  totalFilterCount: number
}

export default function AdvancedFilterPopoverContent({
  fields,
  module,
  moduleActiveFilters,
  totalFilterCount
}: AdvancedFilterPopoverContentProps<BaseFieldItemType>) {
  const { clearActiveFilters, setActiveFilters } = useAdvanceFilterActions()
  const filterGroups = useFilterGroups()
  const groupErrors = useGroupErrors()
  const { setFilterGroups, setPopoverOpen } = useAdvancedFilterActions()
  const hasMultipleGroups = filterGroups.length > 1

  const filterableFields = useMemo<FilterField[]>(() => {
    return getFilterableFields(fields)
  }, [fields])

  const addFilterToGroup = (groupIndex: number) => {
    setFilterGroups(
      create(filterGroups, draft => {
        draft[groupIndex].push(NEW_FILTER)
      })
    )
  }

  const addFilterGroup = () => {
    setFilterGroups(
      create(filterGroups, draft => {
        draft.push([NEW_FILTER])
      })
    )
  }

  const removeFilter = (groupIndex: number, filterIndex: number) => {
    setFilterGroups(
      create(filterGroups, draft => {
        draft[groupIndex].splice(filterIndex, 1)
      }).filter(group => group.length > 0)
    )
  }

  const updateFilter = (groupIndex: number, filterIndex: number, updates: Partial<FilterCondition>) => {
    setFilterGroups(
      create(filterGroups, draft => {
        Object.assign(draft[groupIndex][filterIndex], updates)
      })
    )
  }

  const applyFilters = () => {
    const allValidFilters = filterGroups
      .map(group =>
        group.filter(
          filter =>
            filter.field_key &&
            filter.operator &&
            (filter.value !== undefined ||
              FILTER_OPERATORS_WITHOUT_VALUE.includes(
                filter.operator as (typeof FILTER_OPERATORS_WITHOUT_VALUE)[number]
              ))
        )
      )
      .filter(group => group.length > 0)

    if (allValidFilters.length === 0) {
      clearActiveFilters(module)
      setFilterGroups([[NEW_FILTER]])
      return
    }

    setActiveFilters(allValidFilters, module)
    setPopoverOpen(false)
  }

  const clearFilters = () => {
    clearActiveFilters(module)
    setFilterGroups([[NEW_FILTER]])
    setPopoverOpen(false)
  }

  useEffect(() => {
    if (moduleActiveFilters.length > 0) {
      setFilterGroups(moduleActiveFilters)
    }
  }, [moduleActiveFilters, setFilterGroups])

  return (
    <div className="max-h-[400px] w-[600px] space-y-4 overflow-y-auto px-1 pb-1">
      {filterGroups.map((group, groupIndex) => {
        const shouldShowRemoveButton = hasMultipleGroups || group.length > 1

        return (
          <div key={groupIndex}>
            {group.map((filter, filterIndex) => (
              <div className="mb-3" key={`${groupIndex}-${filterIndex}`}>
                <AdvancedFilterItem
                  errors={getFilterItemErrors(groupErrors, groupIndex, filterIndex)}
                  filter={filter}
                  filterableFields={filterableFields}
                  onRemove={() => removeFilter(groupIndex, filterIndex)}
                  onUpdate={updates => updateFilter(groupIndex, filterIndex, updates)}
                  shouldShowRemoveButton={shouldShowRemoveButton}
                />
              </div>
            ))}

            <div className="mb-3">
              <Button
                className="rounded-full"
                icon={<LuPlus />}
                onClick={() => addFilterToGroup(groupIndex)}
                type="dashed"
              >
                {__('Add Filter')}
              </Button>
            </div>

            {groupIndex < filterGroups.length - 1 && <Divider orientation="center">{__('OR')} </Divider>}
          </div>
        )
      })}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {filterGroups.some(group => group.length > 0) && (
            <Button className="rounded-full" icon={<LuPlus />} onClick={addFilterGroup} type="dashed">
              {__('Add OR Group')}
            </Button>
          )}
        </div>

        {(totalFilterCount > 0 || filterGroups.some(group => group.length > 0)) && (
          <div className="flex gap-2">
            <Button className="rounded-full" onClick={clearFilters}>
              {__('Clear All')}
            </Button>
            <Button className="rounded-full" onClick={applyFilters} type="primary">
              {__('Apply Filters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
