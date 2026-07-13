import { $appConfig } from '@common/globalStates'
import { cn } from '@common/helpers/globalHelpers'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { generateCurrencyFormatPreview } from '@pages/currencies/shared/common-functions'
import { useFieldListStore } from '@pages/deals/state/use-deal-table-fields-store'
import {
  useSelectedKeysActionsStore,
  useSelectedKeysStore
} from '@pages/deals/state/use-selected-deal-keys-store'
import { Checkbox, Tag } from 'antd'
import { useAtomValue } from 'jotai'
import { memo, useMemo, useState } from 'react'
import { NavLink } from 'react-router'

import { type DealCardProps } from '../shared/types'
import DealCardActions from './deal-card-actions'

const parseArrayValue = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) return value as string[]
  try {
    const parsed = JSON.parse(value as string)
    return Array.isArray(parsed) ? (parsed as string[]) : undefined
  } catch {
    return undefined
  }
}

const SHARED_STYLES = {
  link: 'leading-tight text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400',
  text: 'mb-0 mt-1 text-sm font-light text-gray-700 dark:text-gray-300'
} as const

function DealCard({ deal, isDragOverlay = false, stage }: DealCardProps) {
  const fieldList = useFieldListStore()
  const { toggleSelectedKey } = useSelectedKeysActionsStore()
  const selectedKeys = useSelectedKeysStore()
  const { homeCurrencyData } = useAtomValue($appConfig)
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const isSelected = selectedKeys.includes(deal.id)
  const visibleFields = useMemo(
    () => fieldList.filter(field => field?.is_visible && field.field_key !== 'section'),
    [fieldList]
  )

  const renderField = (field: FieldItem) => {
    const fieldKey = field?.field_key
    const fieldLabel = field?.label
    const fieldValue = deal[fieldKey]

    if ((field?.type === 'multi-select' || field?.type === 'checkbox') && fieldValue) {
      const arrayValue = parseArrayValue(fieldValue)
      if (arrayValue) {
        return (
          <div className="mt-1" key={fieldKey} title={fieldLabel}>
            {arrayValue.map(item => (
              <Tag className="text-xs" key={item}>
                {item}
              </Tag>
            ))}
          </div>
        )
      }
    }

    switch (fieldKey) {
      case 'amount': {
        if (deal.home_currency_amount === null) return
        return (
          <p className={SHARED_STYLES.text} key={fieldKey} title={fieldLabel}>
            {generateCurrencyFormatPreview(homeCurrencyData, deal.home_currency_amount)}
          </p>
        )
      }

      case 'company_id': {
        if (!deal.company_id || !deal.company_name) return
        return (
          <NavLink
            className="pointer-events-auto mb-1 block"
            key={fieldKey}
            onClick={e => e.stopPropagation()}
            title={fieldLabel}
            to={`/companies/details/${deal.company_id}`}
          >
            <div className={SHARED_STYLES.link}>{deal.company_name}</div>
          </NavLink>
        )
      }

      case 'contact_id': {
        if (!deal.contact_id || !deal.contact_name) return
        return (
          <NavLink
            className="pointer-events-auto mb-1 block"
            key={fieldKey}
            onClick={e => e.stopPropagation()}
            title={fieldLabel}
            to={`/contacts/details/${deal.contact_id}`}
          >
            <div className={SHARED_STYLES.link}>{deal.contact_name}</div>
          </NavLink>
        )
      }

      case 'name': {
        return (
          <NavLink
            className="pointer-events-auto mb-2 block"
            key={fieldKey}
            onClick={e => e.stopPropagation()}
            title={fieldLabel}
            to={`/deals/details/${deal.id}`}
          >
            <div className={cn(SHARED_STYLES.link, 'text-base font-medium')}>{deal.name}</div>
          </NavLink>
        )
      }

      case 'owner_id': {
        if (!deal.owner_name) return
        return (
          <p
            className="mb-1 block text-sm leading-tight text-gray-700 dark:text-gray-300"
            key={fieldKey}
            title={fieldLabel}
          >
            {deal.owner_name}
          </p>
        )
      }

      case 'probability': {
        return (
          <p className={SHARED_STYLES.text} key={fieldKey} title={fieldLabel}>
            {deal?.probability}%
          </p>
        )
      }

      case 'stage': {
        if (deal?.stage !== stage?.key) return
        return (
          <Tag className="mt-1 text-xs" color={stage?.color} key={fieldKey} title={fieldLabel}>
            {stage?.name}
          </Tag>
        )
      }

      default: {
        if (!fieldValue) return
        return (
          <p className={cn(SHARED_STYLES.text, 'truncate')} key={fieldKey} title={fieldLabel}>
            {fieldValue as string}
          </p>
        )
      }
    }
  }

  return (
    <div
      className={cn(
        'group/card relative rounded border border-gray-200 bg-white p-2 shadow-sm transition-all duration-300 ease-out hover:shadow-md dark:border-slate-600 dark:bg-slate-800',
        isDragOverlay && 'shadow-3xl z-50 cursor-grabbing ring-2 ring-blue-400',
        isSelected && 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20'
      )}
    >
      <div
        className={cn(
          'pointer-events-auto absolute right-2 top-2 transition duration-200',
          !isSelected && 'opacity-0 group-hover/card:opacity-100'
        )}
      >
        <Checkbox
          checked={isSelected}
          id={`deal-${deal.id}`}
          onChange={() => toggleSelectedKey(deal.id)}
        />
      </div>

      {visibleFields.map(renderField)}

      <div
        className={cn(
          'absolute bottom-1 right-1 transition duration-200',
          isActionsOpen ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'
        )}
      >
        <DealCardActions id={deal?.id} open={isActionsOpen} setOpen={setIsActionsOpen} />
      </div>
    </div>
  )
}

export default memo(DealCard)
