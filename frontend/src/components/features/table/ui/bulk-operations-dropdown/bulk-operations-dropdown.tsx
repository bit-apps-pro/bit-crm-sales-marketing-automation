import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Dropdown } from 'antd'
import { type ReactElement } from 'react'
import { LuChevronDown } from 'react-icons/lu'

interface BulkOperationsDropdownProps {
  ids: number[]
  items: ItemType[]
}
interface ItemType {
  capability: string
  icon: ReactElement
  key: string
  label: string
  onClick: () => void
}

export default function BulkOperationsDropdown({ ids, items }: BulkOperationsDropdownProps) {
  return (
    <Dropdown
      arrow
      menu={{
        items: items.map(item => ({
          disabled: !checkCapability(item.capability),
          key: item.key,
          label: (
            <div className="flex items-center gap-2">
              {item.icon}
              {item.label}
            </div>
          ),
          onClick: item.onClick
        }))
      }}
      placement="bottom"
      trigger={['click']}
    >
      <Button className="flex items-center gap-1 rounded-full text-sm" size="large">
        {__('Bulk Actions')} <span>({ids.length})</span>
        <LuChevronDown />
      </Button>
    </Dropdown>
  )
}
