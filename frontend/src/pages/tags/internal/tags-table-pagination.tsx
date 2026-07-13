import PAGINATION from '@common/constants/pagination'
import { showPaginationTotal } from '@common/helpers/globalHelpers'
import { Pagination } from 'antd'
import { useSearchParams } from 'react-router'

export default function TagsTablePagination({ totalTags }: { totalTags: number }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.EXTENDED_PER_PAGE

  const handlePaginationChange = (page: number, perPage: number) => {
    setSearchParams(prev => {
      prev.set('page', page.toString())
      prev.set('perPage', perPage.toString())
      return prev
    })
  }

  return (
    <Pagination
      className="flex h-10 items-center justify-end gap-1"
      current={page}
      onChange={handlePaginationChange}
      pageSize={perPage}
      showSizeChanger={{
        className: 'h-10 [&_.ant-select-selector]:rounded-full'
      }}
      showTotal={showPaginationTotal}
      total={totalTags}
    />
  )
}
