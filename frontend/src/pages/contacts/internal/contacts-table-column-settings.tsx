import { __ } from '@common/helpers/i18nWrap'
import useDebounce from '@common/hooks/use-debounce'
import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'
import TableColumnSettingItem from '@features/table/ui/table-column-setting-item'
import Sortable from '@utilities/sortable'
import { Button, Dropdown, Tooltip } from 'antd'
import { useState } from 'react'
import { LuColumns2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useUpdateContactTableSettings from '../data/use-update-contact-table-settings'
import { type UpdateContactTableSettingsPayloadType } from '../shared/types'
import {
  useContactTableFieldActions,
  useContactTableFieldList
} from '../state/use-contact-table-fields-store'

export default function ContactsTableColumnSettings({
  orders,
  visibleColumns
}: {
  orders: Order[]
  visibleColumns: string[]
}) {
  const [isOpen, setOpen] = useState(false)
  const { setFieldList } = useContactTableFieldActions()
  const fieldList = useContactTableFieldList()
  const [searchParams, setSearchParams] = useSearchParams()
  const sortBy = searchParams.get('sortBy') || ''

  const { updateContactTableSettings } = useUpdateContactTableSettings()
  const updateOrder = useDebounce(
    (settingsData: UpdateContactTableSettingsPayloadType) => updateContactTableSettings(settingsData),
    500
  )

  const handleSortChange = async (sortedFieldList: FieldItem[]) => {
    setFieldList(sortedFieldList)
    const sortedOrder = sortedFieldList.map((field, i) => ({
      field_key: field.field_key,
      order: i
    }))

    await updateOrder({
      setting_key: 'contact_table_columns_order',
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

    await updateContactTableSettings({
      setting_key: 'contact_table_visible_columns',
      setting_value: updatedVisibleColumns
    })
  }

  return (
    <Dropdown
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
      <Tooltip
        destroyOnHidden
        mouseEnterDelay={0.5}
        placement="bottom"
        title={__('Table column settings')}
      >
        <Button
          className="rounded-full text-sm text-gray-500 dark:text-gray-400"
          icon={<LuColumns2 />}
          size="large"
        >
          {__('Columns')}
        </Button>
      </Tooltip>
    </Dropdown>
  )
}
