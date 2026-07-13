import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { renderFullName } from '@common/helpers/entity-helpers'
import { __ } from '@common/helpers/i18nWrap'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type LeadType } from '@pages/lead/shared/lead-types'
import { type RowSelectionState } from '@tanstack/react-table'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import If from '@utilities/If'
import { Button, Checkbox, Typography } from 'antd'
import { type SetStateAction } from 'jotai'
import { type Dispatch, useMemo } from 'react'
import { LuEye } from 'react-icons/lu'
import { Link } from 'react-router'

import DeleteLeadPopup from './delete-lead-popup'

interface LeadsColumnsPropsType {
  columnVisibility: Record<string, boolean>
  fields: FieldItem[]
  handleSortFilterChange: Dispatch<SetStateAction<{ desc: boolean; id: string }[]>>
  leads: LeadType[]
  selectedIds: RowSelectionState
  setColumnVisibility: Dispatch<SetStateAction<Record<string, boolean>>>
  setSelectedIds: Dispatch<SetStateAction<RowSelectionState>>
  sorting: { desc: boolean; id: string }[]
}

export default function LeadsColumns({
  columnVisibility,
  fields,
  handleSortFilterChange,
  leads,
  selectedIds,
  setColumnVisibility,
  setSelectedIds,
  sorting
}: LeadsColumnsPropsType) {
  const columnHelper = createColumnHelper<LeadType>()

  const dynamicColumns = useMemo(
    () =>
      fields.map(field => ({
        accessorKey: field.field_key,
        enableColumnFilter: !(field.type === 'date' || field.field_key === 'full_name'),
        enableHiding: field.field_key !== 'full_name',
        enableSorting: field.field_key !== 'full_name',
        header: field?.label,
        size: 'auto' as unknown
      })),
    [fields]
  )

  const table = useReactTable({
    autoResetPageIndex: false,
    columns: [
      ...(leads.length > 0
        ? [
            columnHelper.display({
              cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  indeterminate={row.getIsSomeSelected()}
                  name="check-all"
                  onChange={row.getToggleSelectedHandler()}
                />
              ),
              header: ({ header }) => (
                <Checkbox
                  checked={table.getIsAllRowsSelected()}
                  id={header.id}
                  indeterminate={table.getIsSomeRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              ),
              id: 'id',
              maxSize: 30
            })
          ]
        : []),
      ...dynamicColumns.map(col =>
        columnHelper.accessor(col.accessorKey as Extract<keyof LeadType, string>, {
          cell: info => {
            if (info.column.id === 'full_name') {
              const lead = info.getValue() as unknown as Record<string, string | undefined>
              return (
                <Link to={`details/${lead.id}`}>
                  <div className="group flex h-full w-full cursor-pointer flex-col hover:text-blue-500">
                    <Typography.Title className="mb-0 text-nowrap group-hover:text-blue-400" level={5}>
                      {renderFullName(lead?.title, lead?.first_name, lead?.last_name)}
                    </Typography.Title>
                    <Typography.Text className="text-nowrap">{lead.email}</Typography.Text>
                  </div>
                </Link>
              )
            }
            return info.getValue()
          },
          enableColumnFilter: col.enableColumnFilter,
          enableHiding: col.enableHiding,
          enableSorting: col.enableSorting,
          header: () => <span>{col.header}</span>,
          size: col.size as number
        })
      ),
      ...(leads.length > 0
        ? [
            columnHelper.display({
              cell: ({ row }) => {
                return (
                  <div>
                    <If conditions={checkCapability(CAPABILITIES.LEAD.VIEW)}>
                      <Link to={`../leads/details/${row?.original?.id}`}>
                        <Button icon={<LuEye size={14} />} type="link" />
                      </Link>
                    </If>

                    <If conditions={checkCapability(CAPABILITIES.LEAD.DELETE)}>
                      <DeleteLeadPopup id={row.original.id} />
                    </If>
                  </div>
                )
              },
              header: () => <span>{__('Actions')}</span>,
              id: 'actions',
              maxSize: 100
            })
          ]
        : [])
    ],
    data: leads.length > 0 ? leads : [],
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => String(row.id),
    manualFiltering: true,
    manualSorting: true,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setSelectedIds,
    onSortingChange: handleSortFilterChange,
    state: {
      columnVisibility,
      rowSelection: selectedIds,
      sorting
    }
  })

  return table
}
