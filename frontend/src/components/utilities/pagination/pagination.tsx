import PAGINATION from '@common/constants/pagination'
import { showPaginationTotal } from '@common/helpers/globalHelpers'
import useBreakpoint from '@common/hooks/use-breakpoint'
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
  const isSmUp = useBreakpoint('sm')
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
    // Below `sm` the row has no room for the total and a full page list together, and a
    // fixed `h-10` let the overflow spill out under the card. So on a phone it wraps
    // (the total takes its own centred line, the pages centre beneath it) and antd's
    // `showLessItems` keeps a long page list to one line, with the item spacing tightened
    // so seven buttons still fit a 360px screen.
    <AntPagination
      className="flex min-h-10 flex-wrap items-center justify-center sm:justify-end sm:gap-1 max-sm:[&>li]:!me-1 max-sm:[&_.ant-pagination-total-text]:w-full max-sm:[&_.ant-pagination-total-text]:text-center"
      current={page}
      onChange={handlePaginationChange}
      pageSize={perPage}
      showLessItems={!isSmUp}
      showSizeChanger={
        showSizeChanger
          ? {
              className:
                'h-10  [&_.ant-select-selector]:rounded-full [&_.ant-pagination-item]:rounded-full'
            }
          : false
      }
      showTotal={showPaginationTotal}
      total={total}
      {...props}
    />
  )
}
