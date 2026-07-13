import { showPaginationTotal } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { type ColumnMeta, type Table } from '@tanstack/react-table'
import If from '@utilities/If'
import TableSkeleton from '@utilities/table-skeleton'
import { Empty, Pagination, Spin } from 'antd'

import TableBodyRow from './ui/table-body-row'
import TableHeaderRow from './ui/table-header-row'

interface TableProps<T> {
  dataLoading?: boolean
  isEmpty: boolean
  onPaginate?: (page: number, pageSize: number) => void
  page?: number
  pagination: boolean
  perPage?: number
  table: Table<T>
  tableLoading?: boolean
  total?: number
}

export interface ColumnMetaSticky extends ColumnMeta<unknown[], unknown> {
  justify: 'center' | 'left' | 'right' | 'space-between'
  sticky: string
}

export default function Table<T>({
  dataLoading,
  isEmpty,
  onPaginate,
  page,
  pagination,
  perPage,
  table,
  tableLoading,
  total
}: TableProps<T>) {
  if (tableLoading) {
    return <TableSkeleton column={5} row={5} />
  }

  return (
    <>
      <div className="scroller thin max-w-full overflow-x-auto rounded-t-md py-1">
        <table className="w-full bg-white dark:bg-slate-900">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableHeaderRow<T> headerGroup={headerGroup} key={headerGroup.id} />
            ))}
          </thead>
          <tbody>
            {!isEmpty && table.getRowModel().rows.map(row => <TableBodyRow<T> key={row.id} row={row} />)}
          </tbody>
        </table>
      </div>

      {(() => {
        if (!total && dataLoading) {
          return (
            <Empty
              description={__('Searching')}
              image={
                <div className="mb-2 flex items-center justify-center" style={{ height: 150 }}>
                  <Spin size="large" />
                </div>
              }
            />
          )
        }

        if (isEmpty) {
          return <Empty description={__('No Data Found')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }

        return
      })()}

      <If conditions={pagination}>
        <Pagination
          className="mt-5 justify-end"
          current={page}
          onChange={onPaginate}
          pageSize={perPage}
          showSizeChanger
          showTotal={showPaginationTotal}
          total={total}
        />
      </If>
    </>
  )
}
