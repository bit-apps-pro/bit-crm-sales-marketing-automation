import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import brandLogo from '@resource/brand-logo.svg'
import If from '@utilities/If'
import ThemeToggle from '@utilities/theme-toggle'
import { Button, Layout } from 'antd'
import { LuSettings } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router'

import HeaderMoreDropdown from './header-more-dropdown'
import HeaderNavItem from './header-nav-item'

const { Header: AntHeader } = Layout

const navItems = [
  { capability: CAPABILITIES.DASHBOARD, label: __('Dashboard'), path: '../' },
  { capability: CAPABILITIES.LEAD.MENU, label: __('Leads'), path: '../leads' },
  { capability: CAPABILITIES.CONTACT.MENU, label: __('Contacts'), path: '../contacts' },
  { capability: CAPABILITIES.COMPANY.MENU, label: __('Companies'), path: '../companies' },
  { capability: CAPABILITIES.DEAL.MENU, label: __('Deals'), path: '../deals' },
  { capability: CAPABILITIES.INVOICE.MENU, label: __('Invoices'), path: '../invoices' }
]

export default function Header() {
  const navigate = useNavigate()

  return (
    <AntHeader className="flex h-16 items-center justify-between gap-4 bg-transparent px-4 py-5">
      <Link className="flex shrink-0 items-center" to="/">
        <svg
          aria-label="Bit CRM"
          className="block h-10 w-auto text-[#171336] dark:text-white"
          height="36"
          role="img"
          viewBox="0 0 152 36"
          width="152"
        >
          <use href={`${brandLogo}#brand-logo`} />
        </svg>
      </Link>
      <div className="flex gap-1">
        {navItems.map(link => {
          if (!checkCapability(link.capability)) {
            return
          }
          return <HeaderNavItem key={link.label} props={link} />
        })}
        <HeaderMoreDropdown />
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <If conditions={checkCapability(CAPABILITIES.SETTING.MENU)}>
          <Button
            className="h-10 w-10 shadow-none"
            classNames={{ icon: ' flex items-center' }}
            icon={<LuSettings className="text-gray-500" size={18} />}
            onClick={() => navigate('/settings')}
            shape="circle"
          />
        </If>
      </div>
    </AntHeader>
  )
}
