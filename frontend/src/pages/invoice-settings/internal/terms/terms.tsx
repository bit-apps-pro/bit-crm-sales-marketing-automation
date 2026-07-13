import PAGINATION from '@common/constants/pagination'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import Pagination from '@utilities/pagination'
import { Button, Typography } from 'antd'
import { useMemo } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useTerms from './data/use-terms'
import { useTermsStoreActions } from './state/use-terms-store'
import TermCreateModal from './ui/term-create-modal'
import TermEditModal from './ui/term-edit-modal'
import TermsTable from './ui/terms-table'

export default function Terms() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE

  const queryParams = useMemo(() => ({ page, perPage }), [page, perPage])
  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const { isTermsFetching, isTermsPending, terms, total } = useTerms(debouncedQueryParams)
  const { handleModal } = useTermsStoreActions()

  const handleCreateModalOpen = () => {
    handleModal('open', setSearchParams, { modal: 'term_create' })
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Typography.Title className="mb-0" level={4}>
          {__('Terms')}
        </Typography.Title>
        <Button
          className="rounded-full shadow-none"
          icon={<LuPlus />}
          onClick={handleCreateModalOpen}
          type="primary"
        >
          {__('New Term')}
        </Button>
      </div>
      <TermsTable data={terms} loading={isTermsFetching || isTermsPending} />
      <div className="mt-4 flex justify-end">
        <Pagination size="small" total={total} />
      </div>
      <TermCreateModal />
      <TermEditModal />
    </div>
  )
}
