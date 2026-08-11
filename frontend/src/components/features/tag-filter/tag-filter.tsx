import { __ } from '@common/helpers/i18nWrap'
import useTags from '@common/hooks/use-tags'
import { Select } from 'antd'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

export default function TagFilter({ module }: { module: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tagParam = searchParams.get('tags')
  const selectedTags = useMemo(() => {
    return tagParam ? tagParam.split(',').filter(Boolean) : []
  }, [tagParam])

  const [open, setOpen] = useState(false)

  const { isTagsFetching, tags } = useTags({
    isEnabled: open || selectedTags.length !== 0,
    module
  })

  const tagOptions = useMemo(
    () =>
      tags.map(tag => ({
        label: tag.title,
        value: tag.id
      })),
    [tags]
  )

  const handleFilterChange = (tagIds: string[]) => {
    setSearchParams(prev => {
      if (tagIds.length === 0) {
        prev.delete('tags')
      } else {
        prev.set('tags', tagIds.join(','))
      }
      return prev
    })
  }

  return (
    <Select
      allowClear
      className="w-52 [&_.ant-select-selection-item]:rounded-full [&_.ant-select-selector]:rounded-full"
      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
      loading={isTagsFetching}
      maxTagCount="responsive"
      mode="multiple"
      onChange={handleFilterChange}
      onOpenChange={setOpen}
      options={tagOptions}
      placeholder={__('Filter With Tags')}
      showSearch
      value={selectedTags}
    />
  )
}
