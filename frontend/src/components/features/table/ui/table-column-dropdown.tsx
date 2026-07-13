import { __ } from '@common/helpers/i18nWrap'
import { type Header } from '@tanstack/react-table'
import { Badge, Button, Dropdown, Input } from 'antd'
import { useState } from 'react'
import { LuEllipsisVertical } from 'react-icons/lu'

interface TableColumnDropdownProps<T> {
  columnSearchValue: string
  header: Header<T, unknown>
  onColumnSearch: (e: React.ChangeEvent<HTMLInputElement>, header: Header<T, unknown>) => void
}

export default function TableColumnDropdown<T>({
  columnSearchValue,
  header,
  onColumnSearch
}: TableColumnDropdownProps<T>) {
  const [settingOpen, setSettingOpen] = useState(false)

  return (
    <Dropdown
      arrow
      onOpenChange={setSettingOpen}
      open={settingOpen}
      placement="top"
      popupRender={() => (
        <div className="overflow-x-scroll rounded bg-white p-2 shadow">
          <Input
            allowClear
            className="w-36"
            defaultValue={columnSearchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onColumnSearch(e, header)}
            placeholder={__('Search')}
            size="small"
            type="text"
          />
        </div>
      )}
      trigger={['click']}
    >
      <Button
        icon={
          columnSearchValue ? (
            <Badge dot offset={[-2, 0]}>
              <LuEllipsisVertical size={16} />
            </Badge>
          ) : (
            <LuEllipsisVertical size={16} />
          )
        }
        type="link"
      />
    </Dropdown>
  )
}
