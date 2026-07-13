import { __ } from '@common/helpers/i18nWrap'
import LoadMoreIndicator from '@utilities/load-more-select/ui/load-more-indicator'
import { Spin, TreeSelect, type TreeSelectProps } from 'antd'
import { type DataNode } from 'antd/es/tree'
import React, { useCallback } from 'react'

export interface LoadMoreTreeSelectProps extends TreeSelectProps {
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  options?: DataNode[]
}

export default function LoadMoreTreeSelect({
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  options = [],
  ...props
}: LoadMoreTreeSelectProps) {
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
    <TreeSelect
      filterTreeNode={false}
      notFoundContent={notFoundContent}
      onPopupScroll={handleScroll}
      popupRender={menu => {
        return (
          <>
            {menu}
            <LoadMoreIndicator loading={loadingMore && hasMore} />
          </>
        )
      }}
      treeData={options}
      {...props}
    />
  )
}
