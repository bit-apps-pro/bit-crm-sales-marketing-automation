import { __ } from '@common/helpers/i18nWrap'
import useDebounce from '@common/hooks/use-debounce'
import { type FieldItem, type Order } from '@common/types/types'
import TableColumnSettingItem from '@features/table/ui/table-column-setting-item'
import Sortable from '@utilities/sortable'
import { Button, Dropdown, Tooltip } from 'antd'
import { useState } from 'react'
import { LuColumns2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import { type SettingsData } from '../data/use-update-related-entity-table-settings'
import useUpdateRelatedEntityTableSettings from '../data/use-update-related-entity-table-settings'
import {
  useRelatedEntityTableFieldList,
  useRelatedEntityTableFieldsStoreActions
} from '../state/use-related-entity-table-field-list-store'

interface RelatedEntitiesTableColumnSettingsProps {
  entity: string
  orders: Order[]
  relatedEntity: string
  visibleColumns: string[]
}

export default function RelatedEntitiesTableColumnSettings({
  entity,
  orders,
  relatedEntity,
  visibleColumns
}: RelatedEntitiesTableColumnSettingsProps) {
  const [isOpen, setOpen] = useState(false)
  const fieldList = useRelatedEntityTableFieldList()
  const { setFieldList } = useRelatedEntityTableFieldsStoreActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const sortBy = searchParams.get('sortBy') || ''
  const { updateRelatedEntityTableSettings } = useUpdateRelatedEntityTableSettings({
    entity,
    relatedEntity
  })

  const updateOrder = useDebounce(
    (settingData: SettingsData) => updateRelatedEntityTableSettings(settingData),
    500
  )

  const handleSortChange = async (sortedFieldList: FieldItem[]) => {
    setFieldList(sortedFieldList)
    const sortedOrder = sortedFieldList.map((field, i) => ({
      field_key: field.field_key,
      order: i
    }))

    await updateOrder({
      setting_key: `${entity}_${relatedEntity}_table_columns_order`,
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
    await updateRelatedEntityTableSettings({
      setting_key: `${entity}_${relatedEntity}_table_visible_columns`,
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
