import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import brandLogo from '@resource/brand-logo.svg'
import If from '@utilities/If'
import ThemeToggle from '@utilities/theme-toggle'
import { Button, Layout } from 'antd'
import { LuSettings } from 'react-icons/lu'
import { Link, useHref, useLocation } from 'react-router'

import HeaderMobileMenu from './header-mobile-menu'
import HeaderMoreDropdown from './header-more-dropdown'
import HeaderNavItem from './header-nav-item'
import { PRIMARY_NAV_ITEMS } from './nav-items'

const { Header: AntHeader } = Layout

export default function Header() {
  const location = useLocation()
  const isSettingsActive = location.pathname.startsWith('/settings')
  const settingsHref = useHref('/settings')

  return (
    <AntHeader className="flex h-16 items-center justify-between gap-2 bg-transparent px-4 py-5 sm:gap-4 sm:px-6">
      <Link className="flex min-w-0 shrink items-center" to="/">
        <svg
          aria-label="Bit CRM"
          className="block h-8 w-auto max-w-full text-[#171336] sm:h-10 dark:text-white"
          height="36"
          role="img"
          viewBox="0 0 152 36"
          width="152"
        >
          <use href={`${brandLogo}#brand-logo`} />
        </svg>
      </Link>
      {/* The pill bar and its overflow dropdown need roughly 700px; below `lg` they are
          replaced wholesale by the drawer, which carries the same destinations. */}
      <div className="hidden gap-1 lg:flex">
        {PRIMARY_NAV_ITEMS.map(link => {
          if (!checkCapability(link.capability)) {
            return
          }
          return <HeaderNavItem key={link.key} props={link} />
        })}
        <HeaderMoreDropdown />
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {/* Settings has its own drawer entry, so the icon button would be a duplicate. */}
        <If conditions={checkCapability(CAPABILITIES.SETTING.MENU)}>
          <Button
            aria-current={isSettingsActive ? 'page' : undefined}
            aria-label={__('Settings')}
            className={cn([
              'hidden h-10 w-10 shadow-none transition-colors duration-300 ease-in-out lg:inline-flex',
              isSettingsActive && 'border-none bg-primary'
            ])}
            classNames={{ icon: ' flex items-center' }}
            href={settingsHref}
            icon={<LuSettings className={isSettingsActive ? 'text-white' : 'text-gray-500'} size={18} />}
            shape="circle"
          />
        </If>
        <HeaderMobileMenu />
      </div>
    </AntHeader>
  )
}
