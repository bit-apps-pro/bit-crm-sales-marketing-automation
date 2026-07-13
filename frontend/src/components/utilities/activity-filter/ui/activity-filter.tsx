import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import LookupFieldSelect from '@features/lookup-field-select/lookup-field-select'
import { type ActivityFilterProps } from '@utilities/activity-filter/shared/type'
import FilterButton from '@utilities/filter-button'
import ModuleSelect from '@utilities/module-select'
import { Button, Popover, Select } from 'antd'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

const selectPrefix = (label: string) => (
  <div className="flex items-center">
    <span className="min-w-12 text-left">{label}</span>
    <span className="mx-1 text-xs text-gray-300">|</span>
  </div>
)

export default function ActivityFilter({ filters, title }: ActivityFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeFilterCount = useMemo(
    () => filters.filter(filter => searchParams.get(filter.key)).length,
    [filters, searchParams]
  )

  const handleFilterChange = (key: string) => (value?: number | string) => {
    setSearchParams(prev => {
      if (value === undefined || value === '') {
        prev.delete(key)
      } else {
        prev.set(key, String(value))
      }
      prev.delete('page')
      return prev
    })
  }

  const clearFilters = () => {
    setSearchParams(prev => {
      filters.forEach(filter => prev.delete(filter.key))
      prev.delete('page')
      return prev
    })
  }

  const content = (
    <div className="flex flex-col gap-2">
      {filters.map(filter => {
        if (filter.key === 'assigned_to')
          return (
            <LookupFieldSelect
              allowClear
              className="w-full"
              key={filter.key}
              onChange={handleFilterChange(filter.key)}
              placeholder={filter.placeholder}
              prefix={selectPrefix(filter.label)}
              queryParams={{ role_filter: config.PLUGIN_SLUG }}
              relatedModule="user"
              showAddNew={false}
              value={searchParams.get(filter.key) || undefined}
            />
          )

        if (filter.key === 'module')
          return (
            <ModuleSelect
              allowClear
              key={filter.key}
              onChange={handleFilterChange(filter.key)}
              options={filter.options}
              placeholder={filter.placeholder}
              prefix={selectPrefix(filter.label)}
              value={searchParams.get(filter.key) || undefined}
            />
          )

        return (
          <Select
            allowClear
            key={filter.key}
            onChange={handleFilterChange(filter.key)}
            options={filter.options}
            placeholder={filter.placeholder}
            prefix={selectPrefix(filter.label)}
            value={searchParams.get(filter.key) || undefined}
          />
        )
      })}
      <div className="flex justify-end">
        <Button
          className="mt-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          disabled={!activeFilterCount}
          onClick={clearFilters}
          type="link"
        >
          {__('Clear all Filters')}
        </Button>
      </div>
    </div>
  )

  return (
    <Popover
      arrow={false}
      classNames={{
        body: 'min-w-64'
      }}
      content={content}
      destroyOnHidden
      placement="bottomRight"
      trigger="click"
    >
      <span>
        <FilterButton activeFilterCount={activeFilterCount} title={title} />
      </span>
    </Popover>
  )
}
