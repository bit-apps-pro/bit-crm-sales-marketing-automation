import PAGINATION from '@common/constants/pagination'
import { showPaginationTotal } from '@common/helpers/globalHelpers'
import { Pagination as AntPagination } from 'antd'
import { type PaginationConfig } from 'antd/es/pagination'
import { useSearchParams } from 'react-router'

interface PaginationProps extends PaginationConfig {
  defaultPerPage?: number
  showSizeChanger?: boolean
  total: number
}

export default function Pagination({
  defaultPerPage,
  showSizeChanger = true,
  total,
  ...props
}: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage')) || defaultPerPage || PAGINATION.DEFAULT_PER_PAGE

  const handlePaginationChange = (page: number, perPage: number) => {
    setSearchParams(prev => {
      prev.set('page', page.toString())
      prev.set('perPage', perPage.toString())
      return prev
    })
  }

  return (
    <AntPagination
      className="flex h-10 items-center justify-end gap-1"
      current={page}
      onChange={handlePaginationChange}
      pageSize={perPage}
      showSizeChanger={
        showSizeChanger
          ? {
              className: 'h-10 [&_.ant-select-selector]:rounded-full'
            }
          : false
      }
      showTotal={showPaginationTotal}
      total={total}
      {...props}
    />
  )
}
