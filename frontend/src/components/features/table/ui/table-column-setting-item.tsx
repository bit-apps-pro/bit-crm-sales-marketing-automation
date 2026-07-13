import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { Button, Checkbox, Typography } from 'antd'
import { LuGripVertical } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'

interface TableColumnSettingItemProps {
  field: FieldItem
  onVisibilityChange: (visibleColumns: string[], field_key: string, isVisible: boolean) => void
  visibleColumns: string[]
}

const TableColumnSettingItem = ({
  field,
  onVisibilityChange,
  visibleColumns
}: TableColumnSettingItemProps) => {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.field_key
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? '150' : '100'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={twMerge(
        'relative m-0 flex items-center justify-between rounded bg-white p-1 dark:bg-slate-800',
        isDragging && 'shadow'
      )}
    >
      <div className="flex items-center justify-start gap-2">
        <Checkbox
          defaultChecked={field.is_visible}
          disabled={['full_name', 'name'].includes(field.field_key)}
          name={field.field_key}
          onChange={e => onVisibilityChange(visibleColumns, field.field_key, e.target.checked)}
        />
        <Typography.Paragraph className="mb-0">{field.label}</Typography.Paragraph>
      </div>
      <Button {...listeners} className="cursor-grab" icon={<LuGripVertical size={16} />} type="text" />
    </div>
  )
}

export default TableColumnSettingItem
