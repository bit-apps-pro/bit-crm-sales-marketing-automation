import { checkCapability } from '@common/helpers/capabilityHelper'
import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Dropdown } from 'antd'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { LuChevronDown } from 'react-icons/lu'
import { NavLink, useLocation } from 'react-router'

import { SECONDARY_NAV_ITEMS } from './nav-items'

export default function HeaderMoreDropdown() {
  const location = useLocation()

  const validMoreMenuItems = useMemo(
    () =>
      SECONDARY_NAV_ITEMS.filter(item => checkCapability(item.capability)).map(item => ({
        key: item.key,
        label: (
          <NavLink className="text-sm font-medium" to={item.path}>
            {item.label}
          </NavLink>
        )
      })),
    []
  )

  const isMoreActive = validMoreMenuItems.some(item => location.pathname.includes(item.key))

  if (validMoreMenuItems.length === 0) {
    // eslint-disable-next-line unicorn/no-null
    return null
  }

  return (
    <Dropdown menu={{ items: validMoreMenuItems }} placement="bottom" trigger={['click']}>
      <button
        className={cn([
          'relative z-0 flex cursor-pointer items-center gap-1 rounded-full border-none bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out',
          isMoreActive ? 'text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white'
        ])}
        type="button"
      >
        {__('More')}
        <LuChevronDown size={14} />
        {isMoreActive && (
          <motion.span
            className="absolute inset-0 z-[-1] h-full w-full rounded-full bg-primary"
            layoutId="header-nav-item-active"
          />
        )}
      </button>
    </Dropdown>
  )
}
