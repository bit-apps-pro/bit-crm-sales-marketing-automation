import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { type BaseFieldItemType } from '@features/entity-form/shared/entity-form-types'
import If from '@utilities/If'
import { Popover, Tag, Typography } from 'antd'
import { LuFilter } from 'react-icons/lu'

import AdvancedFilterPopoverContent from './internal/advanced-filter-popover-content'
import { NEW_FILTER } from './shared/constants'
import { useActiveFilters } from './state/use-advance-filter-persist-store'
import {
  useAdvancedFilterActions,
  useGroupErrors,
  useIsPopoverOpen
} from './state/use-advanced-filter-store'

interface AdvancedFilterProps<T extends BaseFieldItemType> {
  fields: T[]
  module: string
}

export default function AdvancedFilter<T extends BaseFieldItemType>({
  fields,
  module
}: AdvancedFilterProps<T>) {
  const activeFilters = useActiveFilters()
  const isPopoverOpen = useIsPopoverOpen()
  const groupErrors = useGroupErrors()
  const { setFilterGroups, setPopoverOpen } = useAdvancedFilterActions()

  const moduleActiveFilters = activeFilters[module] || []
  const totalFilterCount = moduleActiveFilters.reduce((total, group) => total + group.length, 0)
  const isErrorsPresent = Object.keys(groupErrors).length > 0

  const handleOpenChange = (open: boolean) => {
    setPopoverOpen(open)

    if (open) {
      setFilterGroups(totalFilterCount > 0 ? moduleActiveFilters : [[NEW_FILTER]])
    }
  }

  return (
    <Popover
      arrow={false}
      content={
        <AdvancedFilterPopoverContent
          fields={fields}
          module={module}
          moduleActiveFilters={moduleActiveFilters}
          totalFilterCount={totalFilterCount}
        />
      }
      destroyOnHidden
      onOpenChange={handleOpenChange}
      open={isPopoverOpen}
      placement="bottomLeft"
      title={
        <Typography.Title className="m-0" level={5}>
          {__('Advanced Filter')}
        </Typography.Title>
      }
      trigger="click"
    >
      <div
        className={cn([
          'flex h-10 cursor-pointer items-center gap-1 rounded-full border border-solid bg-white px-1 dark:bg-transparent',
          isErrorsPresent
            ? 'border-red-500 dark:border-red-500'
            : 'border-[#E5E3FE] dark:border-[#3F3A86]'
        ])}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
          <LuFilter size={18} />
        </div>
        <div className="mr-2 flex items-center gap-1">
          <Typography.Text>{__('Advanced Filters')}</Typography.Text>
          <If conditions={totalFilterCount > 0}>
            <Tag className="m-0 text-xs" color="blue">
              {totalFilterCount}
            </Tag>
          </If>
        </div>
      </div>
    </Popover>
  )
}
