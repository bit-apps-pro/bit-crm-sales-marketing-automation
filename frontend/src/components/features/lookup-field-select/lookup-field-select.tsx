import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import If from '@utilities/If'
import LoadMoreSelect from '@utilities/load-more-select'
import { Button, type SelectProps, Space, Tooltip } from 'antd'
import { useState } from 'react'
import { LuRefreshCw } from 'react-icons/lu'

import useLookupSelectOptions, { type RelatedFieldOption } from './data/use-lookup-select-options'
import AddNewButton from './ui/add-new-button'
import LookupFieldNavigation from './ui/lookup-field-navigation'

interface LookupFieldSelectProps extends Omit<SelectProps, 'onChange' | 'options' | 'popupRender'> {
  className?: string
  columnSelect?: string[]
  disabled?: boolean
  fieldKey?: string
  onChange?: (value: number | string, option?: RelatedFieldOption) => void
  queryParams?: Record<string, unknown>
  refetch?: boolean
  relatedModule: string
  showAddNew?: boolean
  sourceModule?: string
  value?: number | string
}

const PER_PAGE = 20

const ADDABLE_MODULES = new Set([MODULES.COMPANY, MODULES.CONTACT, MODULES.DEAL, MODULES.PRODUCT])

export default function LookupFieldSelect({
  className,
  columnSelect,
  disabled = false,
  fieldKey = '',
  onChange,
  queryParams,
  refetch = false,
  relatedModule,
  showAddNew = true,
  sourceModule,
  value,
  ...props
}: LookupFieldSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const debouncedSearchTerm = useDebounceState(searchTerm, 300)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isPending,
    refetch: refetchOptions
  } = useLookupSelectOptions({
    columnSelect,
    perPage: PER_PAGE,
    queryParams,
    relatedModule,
    searchTerm: debouncedSearchTerm,
    selectedValue: value ? Number(value) : undefined,
    sourceModule
  })

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    onChange?.('')
  }

  const handleChange = (value: number | string, option: unknown) => {
    onChange?.(value, option as RelatedFieldOption)
  }

  const handleRefetch = () => refetchOptions()

  const validValue = data?.find(item => item.value === value) ? value : undefined

  return (
    <div className="relative last:mb-4">
      <Space.Compact block>
        <LoadMoreSelect
          allowClear
          className={className}
          disabled={disabled}
          filterOption={false}
          hasMore={hasNextPage || false}
          loading={isFetching || isPending || isFetchingNextPage}
          loadingMore={isFetching || isPending || isFetchingNextPage}
          onChange={handleChange}
          onClear={handleClear}
          onLoadMore={handleLoadMore}
          onOpenChange={setOpen}
          onSearch={setSearchTerm}
          open={open}
          options={data}
          placeholder={__('Search and select')}
          popupFooter={
            <If conditions={showAddNew && ADDABLE_MODULES.has(relatedModule)}>
              <AddNewButton
                fieldKey={fieldKey}
                onClose={() => setOpen(false)}
                relatedModule={relatedModule}
              />
            </If>
          }
          showSearch
          value={validValue}
          {...props}
        />
        {refetch && (
          <Tooltip title={isFetching ? __('Refreshing...') : __('Refresh')}>
            <Button
              disabled={isFetching || isPending}
              icon={<LuRefreshCw />}
              loading={isFetching}
              onClick={handleRefetch}
              size="large"
            />
          </Tooltip>
        )}
      </Space.Compact>
      <LookupFieldNavigation id={validValue} relatedModule={relatedModule} />
    </div>
  )
}
