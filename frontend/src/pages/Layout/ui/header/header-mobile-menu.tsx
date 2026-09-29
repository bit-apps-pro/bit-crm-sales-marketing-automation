import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { drawerPlacement } from '@common/helpers/direction'
import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Drawer } from 'antd'
import { useEffect, useState } from 'react'
import { LuMenu, LuSettings } from 'react-icons/lu'
import { NavLink, useLocation } from 'react-router'

import { type HeaderNavItem, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from './nav-items'

/*
  The small-screen replacement for the whole header nav.

  The desktop bar puts six pills, a "More" dropdown and two icon buttons on one 64px row
  -- roughly 700px of content that cannot wrap without breaking the bar's height. Rather
  than try to compress that, everything moves into a drawer behind a hamburger, which is
  what a phone user expects and gives each destination a full-width tap target.

  The drawer lists the primary and secondary items together: the desktop split between
  the pill bar and "More" exists only because of the width limit, which does not apply to
  a scrolling panel.
*/
export default function HeaderMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Route changes come from tapping a link in here, so the drawer has to dismiss itself;
  // leaving it open would cover the page the user just asked for.
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const visiblePrimary = PRIMARY_NAV_ITEMS.filter(item => checkCapability(item.capability))
  const visibleSecondary = SECONDARY_NAV_ITEMS.filter(item => checkCapability(item.capability))
  const canViewSettings = checkCapability(CAPABILITIES.SETTING.MENU)

  const renderLink = ({ end, key, label, path }: HeaderNavItem) => (
    <NavLink
      className={({ isActive }) =>
        cn([
          'rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-primary text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
        ])
      }
      end={end}
      key={key}
      to={path}
    >
      {label}
    </NavLink>
  )

  return (
    <>
      <Button
        aria-label={__('Menu')}
        className="lg:hidden"
        icon={<LuMenu size={18} />}
        onClick={() => setIsOpen(true)}
        shape="circle"
        type="text"
      />

      <Drawer
        onClose={() => setIsOpen(false)}
        open={isOpen}
        placement={drawerPlacement}
        styles={{ body: { padding: '0.75rem' } }}
        title={__('Menu')}
      >
        <nav className="flex flex-col gap-1">
          {visiblePrimary.map(renderLink)}

          {visibleSecondary.length > 0 && (
            <div className="my-2 border-0 border-t border-solid border-black/10 dark:border-white/10" />
          )}
          {visibleSecondary.map(renderLink)}

          {canViewSettings && (
            <>
              <div className="my-2 border-0 border-t border-solid border-black/10 dark:border-white/10" />
              <NavLink
                className={({ isActive }) =>
                  cn([
                    'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  ])
                }
                to="/settings"
              >
                <LuSettings size={16} />
                {__('Settings')}
              </NavLink>
            </>
          )}
        </nav>
      </Drawer>
    </>
  )
}
