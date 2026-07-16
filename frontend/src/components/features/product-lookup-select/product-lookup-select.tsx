import { ExclamationCircleOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import { PRODUCT_SOURCE } from '@features/product-line-items/shared/constants'
import { getProductSourceOptions } from '@features/product-line-items/shared/options'
import LoadMoreSelect from '@utilities/load-more-select'
import LoadMoreTreeSelect from '@utilities/load-more-tree-select'
import { Input, Select, Space } from 'antd'
import { useMemo, useState } from 'react'

import useLookupSelectOptions from '../lookup-field-select/data/use-lookup-select-options'
import styles from './product-lookup-select.module.css'
import { getDisplayValue, renderLabel } from './shared/helpers'
import { type ProductLookupSelectProps, type ProductOption } from './shared/types'

export default function ProductLookupSelect({
  allowCustomSource = false,
  className,
  disabled = false,
  enableWooProducts = false,
  name,
  onNameChange,
  onSelect,
  onSourceChange,
  productSource,
  value
}: ProductLookupSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounceState(searchTerm, 300)

  const isCustomSource = productSource === PRODUCT_SOURCE.CUSTOM
  const sourceOptions = getProductSourceOptions(enableWooProducts, allowCustomSource)
  const allSourcesDisabled = sourceOptions.every(opt => opt.disabled)

  const {
    data: optionsData,
    errorMessage,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useLookupSelectOptions({
    perPage: 20,
    relatedModule: productSource,
    searchTerm: debouncedSearch,
    selectedValue: value
  })

  const isLoading = isFetching || isFetchingNextPage

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  const handleSelect = (_: number | string, record: unknown) => {
    const productOption = record as ProductOption
    if (productOption?.is_parent) return
    onSelect?.(productOption)
  }

  const notFoundContent = useMemo(() => {
    if (errorMessage) {
      return (
        <div className="flex items-center justify-center gap-2 px-3 py-4 text-red-500">
          <ExclamationCircleOutlined className="text-lg" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )
    }
  }, [errorMessage])

  const treeData = useMemo(() => {
    return optionsData?.map(option => ({
      ...option,
      key: option.value,
      title: option.label,
      value: option.value
    }))
  }, [optionsData])

  const renderSelectComponent = () => {
    if (isCustomSource) {
      return (
        <Input
          className="w-full"
          disabled={disabled}
          onChange={event => onNameChange?.(event.target.value)}
          placeholder={__('Item name')}
          value={name}
        />
      )
    }

    const commonProps = {
      allowClear: false,
      className: 'w-full',
      disabled: disabled || allSourcesDisabled,
      hasMore: hasNextPage || false,
      loading: isLoading,
      loadingMore: isLoading,
      notFoundContent,
      onLoadMore: handleLoadMore,
      onSearch: setSearchTerm,
      onSelect: handleSelect,
      options: treeData,
      placeholder: name || __('Search and select'),
      showSearch: true
    }

    if (enableWooProducts) {
      return (
        <LoadMoreTreeSelect
          {...commonProps}
          classNames={{
            popup: {
              root: styles.treeSelectDropdown
            }
          }}
          treeDefaultExpandAll
          value={getDisplayValue(value, treeData, {
            fallback: name,
            source: productSource,
            wooEnabled: enableWooProducts
          })}
        />
      )
    }

    return (
      <LoadMoreSelect {...commonProps} labelRender={option => renderLabel(option, name)} value={value} />
    )
  }

  return (
    <Space.Compact className={className}>
      <Select
        className="min-w-24"
        onSelect={value => onSourceChange?.(value)}
        optionRender={opt => opt?.data?.optionLabel}
        options={sourceOptions}
        placeholder={__('Source')}
        popupMatchSelectWidth={false}
        popupRender={menu => <div className="w-[150px]">{menu}</div>}
        value={productSource}
      />
      {renderSelectComponent()}
    </Space.Compact>
  )
}
