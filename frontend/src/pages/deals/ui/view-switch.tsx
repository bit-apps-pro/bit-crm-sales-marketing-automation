import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Space } from 'antd'
import { LuKanban, LuList } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import { useDealSettingActionsStore, useDealViewStore } from '../state/use-deal-setting-store'
import { useSelectedKeysActionsStore } from '../state/use-selected-deal-keys-store'

export default function ViewSwitch() {
  const [, setSearchParams] = useSearchParams()
  const { setView } = useDealSettingActionsStore()
  const view = useDealViewStore()
  const { clearSelectedKeys } = useSelectedKeysActionsStore()

  const handleViewChange = (view: 'kanban' | 'table') => {
    clearSelectedKeys()
    setView(view, setSearchParams)
  }

  return (
    <Space.Compact className="rounded-full" direction="horizontal" size="large">
      <Button
        className={cn('rounded-s-full text-sm', view !== 'table' && 'text-gray-500 dark:text-gray-400')}
        icon={<LuList />}
        onClick={() => handleViewChange('table')}
        type={view === 'table' ? 'primary' : 'default'}
      >
        {__('List')}
      </Button>
      <Button
        className={cn('rounded-e-full text-sm', view !== 'kanban' && 'text-gray-500 dark:text-gray-400')}
        icon={<LuKanban />}
        onClick={() => handleViewChange('kanban')}
        type={view === 'kanban' ? 'primary' : 'default'}
      >
        {__('Kanban')}
      </Button>
    </Space.Compact>
  )
}
