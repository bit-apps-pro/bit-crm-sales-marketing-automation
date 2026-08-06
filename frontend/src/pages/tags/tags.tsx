import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import PAGINATION from '@common/constants/pagination'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import ModuleFilter from '@features/module-filter'
import { useTagStoreActions } from '@pages/tags/state/use-tag-store'
import If from '@utilities/If'
import { Input as AntInput, Button, Typography } from 'antd'
import { useMemo } from 'react'
import { LuPlus, LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useTags from './data/use-tags'
import TagsBulkOperations from './internal/tag-bulk-operations/ui/tags-bulk-operations'
import TagsTablePagination from './internal/tags-table-pagination'
import { useTagStoreSelectedKeys } from './state/use-selected-tag-keys-store'
import TagCreateModal from './ui/tag-create-modal'
import TagEditModal from './ui/tag-edit-modal'
import TagsTable from './ui/tags-table'

export default function Tags() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTagKeys = useTagStoreSelectedKeys()
  const page = Number(searchParams.get('page')) || 1
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.EXTENDED_PER_PAGE
  const searchTerm = searchParams.get('searchTerm') || ''
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const modules = useMemo(() => searchParams.get('modules')?.split(',') || [], [searchParams])

  const queryParams = useMemo(
    () => ({
      modules,
      page,
      perPage,
      searchTerm,
      sortBy,
      sortOrder
    }),
    [modules, page, perPage, searchTerm, sortBy, sortOrder]
  )

  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const { isFetchingTags, isTagsLoading, refetchTags, tags, total } = useTags(debouncedQueryParams)

  const { handleModal } = useTagStoreActions()

  const handleSearchChange = (e: { target: { value: string } }) => {
    setSearchParams(prev => {
      if (prev.has('page')) {
        prev.set('page', '1')
      }
      if (!e.target.value) {
        prev.delete('searchTerm')
        return prev
      }
      prev.set('searchTerm', e.target.value)
      return prev
    })
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={3}>
            {__('Tags')}
          </Typography.Title>

          <If conditions={checkCapability(CAPABILITIES.TAG.CREATE)}>
            <Button
              className="rounded-full"
              icon={<LuPlus />}
              onClick={() => handleModal('open', setSearchParams, { modal: 'create' })}
              size="large"
              type="primary"
            >
              {__('New Tag')}
            </Button>
          </If>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 p-3">
          <div>
            <If conditions={selectedTagKeys.length !== 0}>
              <TagsBulkOperations />
            </If>
          </div>
          <div className="flex items-center gap-2">
            <ModuleFilter excludeModules={[MODULES.INVOICE]} />
            <AntInput
              allowClear
              className="ml-auto w-52 rounded-full"
              defaultValue={searchTerm}
              onChange={handleSearchChange}
              placeholder={__('Search')}
              prefix={<LuSearch className="text-gray-500 dark:text-gray-400" />}
              type="search"
            />
          </div>
        </div>
        <TagsTable isFetchingTags={isFetchingTags} isTagsLoading={isTagsLoading} tags={tags} />
        <div className="flex justify-center py-5">
          <TagsTablePagination totalTags={total || 0} />
        </div>
      </div>
      <TagCreateModal refetchTags={refetchTags} />
      <TagEditModal refetchTags={refetchTags} />
    </div>
  )
}
