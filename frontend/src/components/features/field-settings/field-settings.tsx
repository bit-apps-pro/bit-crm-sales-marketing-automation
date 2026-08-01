import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import useDebounce from '@common/hooks/use-debounce'
import FieldWrapper from '@features/form-builder/index'
import { MODULE_FIELD_CONFIG } from '@features/form-builder/shared/module-field-config'
import { useAddFieldModalActions } from '@features/form-builder/state/use-add-field-modal-store'
import AddNewFieldModal from '@features/form-builder/ui/add-new-field-modal'
import FieldRenderer from '@features/form-builder/ui/field-renderer'
import If from '@utilities/If'
import Sortable from '@utilities/sortable'
import { Radio, Typography } from 'antd'
import { isEqual } from 'lodash'
import { useEffect, useState } from 'react'
import { LuAlignJustify, LuColumns2 } from 'react-icons/lu'

import useFields from './data/use-fields'
import useUpdateFields from './data/use-update-fields'
import useUpsertColumnSettings from './data/use-upsert-column-settings'
import { type FieldItem, type UpdateFieldsPayloadType } from './shared/field-types'
import { useFieldList, useFieldsActions } from './state/use-fields-store'

interface FieldSettingsPropsType {
  module: string
}

export default function FieldSettings({ module }: FieldSettingsPropsType) {
  const { columnSettingsKey, orderKey } = MODULE_FIELD_CONFIG[module]
  const { reset, setFieldList } = useFieldsActions()
  const { reset: resetAddFieldModal } = useAddFieldModalActions()
  const fieldList = useFieldList()
  const { updateFields } = useUpdateFields(module)
  const { columnSettings, fields, isFieldsFetching, orders } = useFields(module)
  const updateOrder = useDebounce(
    (settingsData: UpdateFieldsPayloadType) => updateFields(settingsData),
    500
  )
  const [columnSize, setColumnSize] = useState<number>(2)
  const { columnSettingsUpdating, upsertColumnSettings } = useUpsertColumnSettings(module)

  const handleColumnSettingsUpsert = (columnSize: number) => {
    upsertColumnSettings({
      setting_key: columnSettingsKey,
      setting_value: {
        column_size: columnSize
      }
    })
    setColumnSize(columnSize)
  }

  const handleSortChange = (sortedFieldList: FieldItem[]) => {
    setFieldList(sortedFieldList)
    const sortedOrder = sortedFieldList.map((field, i) => ({ field_key: field.field_key, order: i }))

    updateOrder({
      setting_key: orderKey,
      setting_value: sortedOrder
    })
  }

  useEffect(() => {
    const isFieldListInInitialState = fields.length && fieldList.length === 0
    const isNewFieldAdded = fields.length > fieldList.length

    const hasFieldChanged = !(
      fields.length === fieldList.length &&
      fields.every(field => fieldList.some(item => isEqual(item, field)))
    )

    if (isFieldListInInitialState || isNewFieldAdded || hasFieldChanged) {
      setFieldList(fields)
    }
  }, [fields, fieldList, setFieldList])

  useEffect(() => {
    if (typeof columnSettings === 'object' && columnSettings !== null) {
      setColumnSize(columnSettings.column_size || 1)
    }
  }, [columnSettings])

  useEffect(
    () => () => {
      reset()
      resetAddFieldModal()
    },
    [reset, resetAddFieldModal]
  )

  return (
    <div className="light:bg-slate-100 space-y-2 rounded-lg">
      <div className="flex items-center gap-5">
        <Typography.Title className="mb-0" level={4}>
          {__('Fields')}
        </Typography.Title>

        <AddNewFieldModal module={module} />

        <div className="flex items-center gap-1">
          <Radio.Group
            buttonStyle="solid"
            disabled={columnSettingsUpdating}
            onChange={e => handleColumnSettingsUpsert(e.target.value)}
            value={columnSize}
          >
            <Radio.Button value={1}>
              <div className="flex items-center gap-1">
                <LuAlignJustify />
                {__('Single Column')}
              </div>
            </Radio.Button>
            <Radio.Button value={2}>
              <div className="flex items-center gap-1">
                <LuColumns2 />
                {__('Two Columns')}
              </div>
            </Radio.Button>
          </Radio.Group>
        </div>

        <If conditions={isFieldsFetching}>
          <LoadingOutlined />
        </If>
      </div>

      <Sortable items={fieldList} onSortChange={handleSortChange} orders={orders}>
        {fieldList.map(field => (
          <FieldWrapper<FieldItem> item={field} key={field.field_key} module={module}>
            <FieldRenderer
              id={field?.id}
              isCustom={field.is_custom}
              isGroup={!!field.group_fields}
              isSection={field.type === 'section'}
              label={field.label}
              type={field.type}
            />
          </FieldWrapper>
        ))}
      </Sortable>
    </div>
  )
}
