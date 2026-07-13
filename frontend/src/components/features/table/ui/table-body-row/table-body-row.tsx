import { cn } from '@common/helpers/globalHelpers'
import { type ColumnMetaSticky } from '@features/table/table'
import { flexRender, type Row } from '@tanstack/react-table'
import { Tag } from 'antd'

interface TableBodyRowProps<T> {
  row: Row<T>
}

export default function TableBodyRow<T>({ row }: TableBodyRowProps<T>) {
  return (
    <tr key={row.id}>
      {row.getVisibleCells().map(cell => {
        const isSticky = (cell.column.columnDef.meta as ColumnMetaSticky)?.sticky
        let value = cell.getValue()
        try {
          value = JSON.parse(cell.getValue() as string)
        } catch {
          // empty scope
        }
        const isArray = Array.isArray(value)
        return (
          <td
            className={cn([
              'max-w-80 truncate border border-solid border-slate-200 dark:border-slate-600',
              isSticky ? 'sticky z-20 bg-slate-50 px-2 py-1 dark:bg-slate-950' : 'px-2 py-1',
              isSticky === 'right' ? 'right-0' : 'left-0'
            ])}
            key={cell.id}
          >
            {isArray ? (
              <div className="flex flex-row flex-wrap gap-1">
                {(value as string[])?.map(item => (
                  <Tag className="m-0 text-xs" key={item}>
                    {item}
                  </Tag>
                ))}
              </div>
            ) : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </td>
        )
      })}
    </tr>
  )
}
