import { __ } from '@common/helpers/i18nWrap'
import { type ColumnMetaSticky } from '@features/table/table'
import { type Header, type HeaderGroup } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { LuArrowDown, LuArrowUp, LuChevronsUpDown } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'

import TableColumnDropdown from '../table-column-dropdown'

interface TableHeaderRowProps<T> {
  headerGroup: HeaderGroup<T>
}

export default function TableHeaderRow<T>({ headerGroup }: TableHeaderRowProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleColumnSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    header: Header<T, unknown>
  ) => {
    setSearchParams(prev => {
      if (prev.has('page')) {
        prev.set('page', '1')
      }

      if (!e.target.value) {
        prev.delete(header.column.id)
        return prev
      }

      prev.set(header.column.id, e.target.value)
      return prev
    })
  }

  return (
    <tr className="bg-slate-50 dark:bg-slate-950" key={headerGroup.id}>
      {headerGroup.headers.map(header => {
        const isSticky = (header.column.columnDef.meta as ColumnMetaSticky)?.sticky
        const justify = (header.column.columnDef.meta as ColumnMetaSticky)?.justify
        return (
          <th
            className={twMerge(
              'text-nowrap border border-solid border-slate-200 text-start dark:border-slate-600',
              isSticky ? 'sticky z-10 bg-slate-50 px-4 py-2 dark:bg-slate-950' : 'px-2 py-2',
              isSticky === 'right' ? 'right-0' : 'left-0'
            )}
            colSpan={header.colSpan}
            key={header.id}
            style={{ width: Number.isNaN(header.getSize()) ? 'auto' : header.getSize() }}
          >
            {header.isPlaceholder ? undefined : (
              <div
                className={twMerge(
                  'flex items-center gap-4',
                  justify || 'justify-between',
                  header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                )}
                onClick={header.column.getToggleSortingHandler()}
                onKeyDown={
                  header.column.getCanSort()
                    ? e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          header.column.getToggleSortingHandler()?.(e as React.KeyboardEvent)
                        }
                      }
                    : undefined
                }
                role={header.column.getCanSort() ? 'button' : undefined}
                tabIndex={header.column.getCanSort() ? 0 : undefined}
              >
                <div className="flex items-center gap-2">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: <LuArrowUp className="text-slate-500" size={14} />,
                    desc: <LuArrowDown className="text-slate-500" size={14} />,
                    false: header.column.getCanSort() && (
                      <LuChevronsUpDown className="text-slate-400" size={14} />
                    )
                  }[header.column.getIsSorted() as string] ?? undefined}
                </div>
                {header.column.getCanFilter() && (
                  <div
                    aria-label={__('Open column filter dropdown')}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <TableColumnDropdown<T>
                      columnSearchValue={(searchParams.get(header.column.id) ?? '') as string}
                      header={header}
                      onColumnSearch={handleColumnSearchChange}
                    />
                  </div>
                )}
              </div>
            )}
          </th>
        )
      })}
    </tr>
  )
}
