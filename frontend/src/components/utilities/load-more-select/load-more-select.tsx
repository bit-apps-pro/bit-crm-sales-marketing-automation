import { __ } from '@common/helpers/i18nWrap'
import { Select, type SelectProps, Spin } from 'antd'
import { type DefaultOptionType } from 'antd/es/select'
import React, { useCallback } from 'react'

import LoadMoreIndicator from './ui/load-more-indicator'

export interface LoadMoreSelectProps extends Omit<SelectProps, 'options' | 'popupRender'> {
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  options?: DefaultOptionType[]
  popupFooter?: React.ReactNode
}

export default function LoadMoreSelect({
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  options = [],
  popupFooter,
  ...props
}: LoadMoreSelectProps) {
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && !loadingMore) {
      try {
        onLoadMore()
      } catch (error) {
        console.error('Error loading more options:', error)
      }
    }
  }, [onLoadMore, loadingMore])

  const notFoundContent = props.loading ? (
    <div className="flex items-center justify-center py-2">
      <Spin size="small" />
      <span className="ml-2">{__('Loading...')}</span>
    </div>
  ) : (
    props.notFoundContent || __('No data')
  )

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMore) return

      const { offsetHeight, scrollHeight, scrollTop } = e.currentTarget ?? {}
      const scrollBottom = scrollTop + offsetHeight
      const threshold = 20

      if (scrollBottom >= scrollHeight - threshold) {
        handleLoadMore()
      }
    },
    [hasMore, handleLoadMore]
  )

  return (
    <Select
      notFoundContent={notFoundContent}
      onPopupScroll={handleScroll}
      options={options}
      popupRender={menu => (
        <>
          {menu}
          <LoadMoreIndicator loading={loadingMore && hasMore} />
          {popupFooter}
        </>
      )}
      {...props}
    />
  )
}
