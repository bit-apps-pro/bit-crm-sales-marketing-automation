import { __ } from '@common/helpers/i18nWrap'
import useDebounce from '@common/hooks/use-debounce'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type Order } from '@features/form-builder/shared/field-types'
import TableColumnSettingItem from '@features/table/ui/table-column-setting-item'
import Sortable from '@utilities/sortable'
import { Button, Dropdown } from 'antd'
import { useState } from 'react'
import { LuColumns2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useUpdateLeadTableSettings from '../data/use-update-lead-table-settings'
import { type UpdateLeadTableSettingsPayloadType } from '../shared/leads-types'
import { useLeadTableFieldActions, useLeadTableFieldList } from '../state/use-lead-table-fields-store'

export default function LeadsTableColumnSettings({
  orders,
  visibleColumns
}: {
  orders: Order[]
  visibleColumns: string[]
}) {
  const [isOpen, setOpen] = useState(false)
  const fieldList = useLeadTableFieldList()
  const { setFieldList } = useLeadTableFieldActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const sortBy = searchParams.get('sortBy') || ''

  const { updateLeadTableSettings } = useUpdateLeadTableSettings()
  const updateOrder = useDebounce(
    (settingsData: UpdateLeadTableSettingsPayloadType) => updateLeadTableSettings(settingsData),
    500
  )

  const handleSortChange = async (sortedFieldList: FieldItem[]) => {
    setFieldList(sortedFieldList)
    const sortedOrder = sortedFieldList.map((field, i) => ({
      field_key: field.field_key,
      order: i
    }))

    await updateOrder({
      setting_key: 'lead_table_columns_order',
      setting_value: sortedOrder
    })
  }

  const handleVisibilityChange = async (
    visibleColumns: string[],
    fieldKey: string,
    isVisible: boolean
  ) => {
    const updatedVisibleColumns = isVisible
      ? [...visibleColumns, fieldKey]
      : visibleColumns.filter(columnId => columnId !== fieldKey)

    setFieldList(prevFields =>
      prevFields.map(field =>
        field.field_key === fieldKey ? { ...field, is_visible: isVisible } : field
      )
    )

    if (!isVisible && sortBy === fieldKey) {
      setSearchParams(prev => {
        prev.delete('sortBy')
        prev.delete('sortOrder')
        return prev
      })
    }

    await updateLeadTableSettings({
      setting_key: 'lead_table_visible_columns',
      setting_value: updatedVisibleColumns
    })
  }

  return (
    <Dropdown
      arrow
      onOpenChange={setOpen}
      open={isOpen}
      overlayClassName="w-60"
      popupRender={() => (
        <div className="max-h-96 overflow-y-auto rounded bg-white p-2 shadow dark:bg-slate-800">
          <Sortable items={fieldList} onSortChange={handleSortChange} orders={orders}>
            {fieldList.map(field => (
              <TableColumnSettingItem
                field={field}
                key={field.field_key}
                onVisibilityChange={handleVisibilityChange}
                visibleColumns={visibleColumns}
              />
            ))}
          </Sortable>
        </div>
      )}
      trigger={['click']}
    >
      <Button
        className="rounded-full text-sm text-gray-500 dark:text-gray-400"
        icon={<LuColumns2 />}
        size="large"
      >
        {__('Columns')}
      </Button>
    </Dropdown>
  )
}
