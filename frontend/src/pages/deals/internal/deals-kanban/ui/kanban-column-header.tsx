import { $appConfig } from '@common/globalStates'
import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'
import {
  useSelectedKeysActionsStore,
  useSelectedKeysStore
} from '@pages/deals/state/use-selected-deal-keys-store'
import { Badge, Checkbox, Tag } from 'antd'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

interface KanbanColumnHeaderProps {
  amount: number
  count: number
  ids: number[]
  stage: Stage
}

export default function KanbanColumnHeader({ amount, count, ids, stage }: KanbanColumnHeaderProps) {
  const { homeCurrencyData } = useAtomValue($appConfig)
  const { setSelectedKeys } = useSelectedKeysActionsStore()
  const selectedKeys = useSelectedKeysStore()

  const allSelected = useMemo(
    () => ids.length > 0 && ids.every(id => selectedKeys.includes(id)),
    [ids, selectedKeys]
  )

  const someSelected = useMemo(
    () => ids.some(id => selectedKeys.includes(id)) && !allSelected,
    [ids, selectedKeys, allSelected]
  )

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedKeys(selectedKeys.filter(key => !ids.includes(key as number)))
    } else {
      setSelectedKeys([...new Set([...ids, ...selectedKeys])])
    }
  }, [allSelected, ids, selectedKeys, setSelectedKeys])

  return (
    <div className="flex-shrink-0 px-4 py-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="mb-0 text-base font-light text-gray-900 dark:text-gray-50">{stage.name}</h4>
            <Tag className="m-0 text-xs" color={stage.color || 'blue'}>
              {count}
            </Tag>

            <Badge color="gray" />

            <div className="text-xs font-medium" style={{ color: stage.color }}>
              {typeof stage.probability === 'number'
                ? stage.probability
                : String(stage.probability || 0)}
              %
            </div>
          </div>
          <h4 className="text-sm font-semibold tracking-wider text-gray-800 dark:text-gray-200">
            {generateCurrencyFormatPreview(homeCurrencyData, amount)}
          </h4>
        </div>
        <div
          className={cn(
            'text-right transition duration-200',
            !selectedKeys.length && 'opacity-0 group-hover/column:opacity-100'
          )}
        >
          <Checkbox
            checked={allSelected}
            id={`stage-${stage.key}`}
            indeterminate={someSelected}
            onChange={handleSelectAll}
            title={allSelected ? __('Deselect All') : __('Select All')}
          />
        </div>
      </div>
    </div>
  )
}
