import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import If from '@utilities/If'
import { Button, Select, Switch, Typography } from 'antd'
import { LuGripVertical } from 'react-icons/lu'

import useUpdateFieldSettings from './data/use-update-field-settings'
import fieldStyle from './field-wrapper.module.css'
import { WIDTH_OPTIONS } from './shared/constants'
import { type BaseFieldType, type FieldWrapperPropsType } from './shared/field-types'
import CustomFieldRowActions from './ui/custom-field-row-actions'
import EditFieldModal from './ui/edit-field-modal'
import EditFieldsGroupModal from './ui/edit-fields-group-modal'

export default function FieldWrapper<T extends BaseFieldType>({
  children,
  item,
  module
}: FieldWrapperPropsType<T>) {
  const { updateFieldSettings } = useUpdateFieldSettings(module)
  const {
    field_key: fieldKey,
    group_fields: groupField,
    is_always_required: isAlwaysRequired,
    is_custom: isCustom,
    is_editable: isEditable,
    required,
    status,
    type
  } = item ?? {}
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: fieldKey
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? '150' : '100'
  }

  const handleUpdateSettings = async (values: Record<string, Record<string, boolean | string>>) => {
    await updateFieldSettings(values)
  }

  const handleStateChange = (value: boolean, type: 'required' | 'status') => {
    return handleUpdateSettings({ [fieldKey]: { [type]: value } })
  }

  const handleWidthChange = (value: string) => {
    return handleUpdateSettings({ [fieldKey]: { width: value } })
  }

  const editable = isEditable === undefined ? true : isEditable

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        fieldStyle.field,
        'group relative m-0 flex cursor-auto items-center gap-2 rounded border border-solid border-[#EBEAFF] bg-white p-1 pr-4 transition-shadow first:mt-4 dark:border-neutral-700 dark:bg-neutral-900',
        isDragging && 'shadow-lg',
        type === 'section' && 'mt-4'
      )}
    >
      <Button type="text" {...listeners} className="cursor-grab p-1 text-slate-500 hover:text-slate-800">
        <LuGripVertical size={14} />
      </Button>

      {children}

      <div
        className={cn(
          fieldStyle.fieldAction,
          'flex items-center justify-end gap-1 transition-opacity duration-200'
        )}
      >
        <If conditions={Boolean(!isCustom && !isAlwaysRequired && !groupField && type !== 'section')}>
          <div className="flex items-center justify-center gap-2 px-1">
            <Typography.Text className="light:text-slate-700 mb-0 text-xs" ellipsis={true}>
              {__('Required')}
            </Typography.Text>
            <Switch
              defaultChecked={required}
              onChange={value => handleStateChange(value, 'required')}
              size="small"
            />
          </div>
          <div className="flex items-center justify-center gap-2 px-1">
            <Typography.Text className="light:text-slate-700 mb-0 text-xs" ellipsis={true}>
              {__('Disabled')}
            </Typography.Text>
            <Switch
              defaultChecked={status === undefined ? false : !status}
              onChange={value => handleStateChange(!value, 'status')}
              size="small"
            />
          </div>
        </If>

        <If conditions={Boolean(!isCustom && !groupField && type !== 'section')}>
          <Select
            onChange={handleWidthChange}
            options={WIDTH_OPTIONS}
            placeholder={__('Select Width')}
            size="small"
            value={typeof item?.width === 'string' ? item.width : undefined}
            variant="borderless"
          />
        </If>

        <If conditions={Boolean(isCustom)}>
          <CustomFieldRowActions item={item} module={module} />
        </If>

        <If conditions={groupField}>
          <EditFieldsGroupModal<T> item={item} onStateChange={handleUpdateSettings} />
        </If>

        <If
          conditions={[
            Boolean(
              (!groupField && isCustom) ||
              type === 'select' ||
              type === 'multi-select' ||
              type === 'radio' ||
              type === 'checkbox' ||
              type === 'section'
            ),
            Boolean(editable)
          ]}
        >
          <EditFieldModal item={item} module={module} />
        </If>
      </div>
    </div>
  )
}
