import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import SearchInput from '@utilities/search-input'
import { Button, Select, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

import useLinks from './data/use-links'
import { DEFAULT_PAGE, DEFAULT_PER_PAGE, RECENT_FIRST, SORT_OPTIONS } from './shared/constants'
import useLinkStore from './state/use-link-store'
import LinkCreateModal from './ui/link-create-modal'
import LinkEditModal from './ui/link-edit-modal'
import LinkTable from './ui/link-table'

interface LinksProps {
  entityId: number
  fields: FieldItem[]
  module: string
}

const generateFieldOptions = (fields: FieldItem[]) => {
  const options: { label: string; value: string }[] = []

  fields.forEach(field => {
    if (field.type === 'section') {
      return
    }

    if (field.group_fields) {
      const nestedOptions = generateFieldOptions(Object.values(field.group_fields))
      options.push(...nestedOptions)
    } else {
      options.push({
        label: field.label,
        value: `{${field.field_key}}`
      })
    }
  })

  return options
}

export default function Links({ entityId, fields, module }: LinksProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useLinkStore()
  const page = searchParams.get('page') || DEFAULT_PAGE
  const perPage = searchParams.get('perPage') || DEFAULT_PER_PAGE
  const sortOrder = searchParams.get('sortOrder') || RECENT_FIRST

  const fieldOptions = generateFieldOptions(fields)

  const { isFetchingLinks, isRefetchingLinks, links, total } = useLinks(
    module,
    entityId,
    page,
    perPage,
    sortOrder,
    searchDebounced
  )

  useDebounce(() => setSearchDebounced(search), 300, [search])

  const handleSortChange = (value: string) => {
    setSearchParams(prev => {
      prev.set('sortOrder', value)
      return prev
    })
  }

  useEffect(() => {
    if (!isFetchingLinks && !isRefetchingLinks && links?.length === 0 && Number(page) !== 1) {
      setSearchParams(prev => {
        prev.set('page', '1')
        return prev
      })
    }
  }, [isFetchingLinks, isRefetchingLinks, links?.length, page, setSearchParams])

  return (
    <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex justify-between gap-2 p-2">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={5}>
            {__('Links')}
          </Typography.Title>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'link_create' })}
            type="primary"
          >
            {__('New')}
          </Button>
          <If conditions={isFetchingLinks || isRefetchingLinks}>
            <LoadingOutlined />
          </If>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Select
            className="[&_.ant-select-selection-item]:rounded-full [&_.ant-select-selector]:rounded-full"
            defaultValue={sortOrder}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            style={{ width: 150 }}
          />

          <SearchInput queryKey="search" />
        </div>
      </div>
      <div>
        <LinkTable links={links} loading={isFetchingLinks} />
        <div className="flex justify-center py-2">
          <Pagination total={total} />
        </div>
      </div>
      <LinkCreateModal entityId={entityId} fieldOptions={fieldOptions} module={module} />
      <LinkEditModal fieldOptions={fieldOptions} />
    </div>
  )
}
