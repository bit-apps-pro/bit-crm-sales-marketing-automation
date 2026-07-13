import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { renderFullName } from '@common/helpers/entity-helpers'
import { __ } from '@common/helpers/i18nWrap'
import { type ContactType } from '@pages/contact/shared/contact-types'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import If from '@utilities/If'
import { Button, Checkbox, Typography } from 'antd'
import { LuEye } from 'react-icons/lu'
import { Link } from 'react-router'

import { type ContactsColumnsPayloadType } from '../shared/types'
import DeleteContactPopup from './delete-contact-popup'

export default function ContactsColumns({
  columnVisibility,
  contacts,
  fields,
  handleSortFilterChange,
  selectedIds,
  setColumnVisibility,
  setSelectedIds,
  sorting
}: ContactsColumnsPayloadType) {
  const columnHelper = createColumnHelper<ContactType>()

  const dynamicColumns = fields.map(field => ({
    accessorKey: field.field_key,
    enableColumnFilter: !(field.type === 'date' || field.field_key === 'full_name'),
    enableHiding: field.field_key !== 'full_name',
    enableSorting: field.field_key !== 'full_name',
    header: field?.label,
    size: 'auto' as unknown
  }))

  const table = useReactTable({
    columns: [
      ...(contacts.length > 0
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
        columnHelper.accessor(col.accessorKey as Extract<keyof ContactType, string>, {
          cell: info => {
            if (info.column.id === 'full_name') {
              const contact = info.getValue() as unknown as Record<string, string | undefined>
              return (
                <Link to={`details/${contact.id}`}>
                  <div className="group flex h-full w-full cursor-pointer flex-col hover:text-blue-500">
                    <Typography.Title className="mb-0 text-nowrap group-hover:text-blue-400" level={5}>
                      {renderFullName(contact?.title, contact?.first_name, contact?.last_name)}
                    </Typography.Title>
                    <Typography.Text className="text-nowrap">{contact.email}</Typography.Text>
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
      ...(contacts.length > 0
        ? [
            columnHelper.display({
              cell: ({ row }) => {
                return (
                  <div>
                    <If conditions={checkCapability(CAPABILITIES.CONTACT.VIEW)}>
                      <Link to={`../contacts/details/${row?.original?.id}`}>
                        <Button icon={<LuEye size={14} />} type="link" />
                      </Link>
                    </If>

                    <If conditions={checkCapability(CAPABILITIES.CONTACT.DELETE)}>
                      <DeleteContactPopup id={row.original.id} />
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
    data: contacts.length > 0 ? contacts : [],
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
