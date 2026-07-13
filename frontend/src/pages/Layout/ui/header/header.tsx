import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import ThemeToggle from '@utilities/theme-toggle'
import { Button, Layout } from 'antd'
import { LuSettings } from 'react-icons/lu'
import { useNavigate } from 'react-router'

import HeaderMoreDropdown from './header-more-dropdown'
import HeaderNavItem from './header-nav-item'

const { Header: AntHeader } = Layout

const navItems = [
  { capability: CAPABILITIES.DASHBOARD, label: __('Dashboard'), path: '../' },
  { capability: CAPABILITIES.LEAD.MENU, label: __('Leads'), path: '../leads' },
  { capability: CAPABILITIES.CONTACT.MENU, label: __('Contacts'), path: '../contacts' },
  { capability: CAPABILITIES.COMPANY.MENU, label: __('Companies'), path: '../companies' },
  { capability: CAPABILITIES.DEAL.MENU, label: __('Deals'), path: '../deals' },
  { capability: CAPABILITIES.PRODUCT.MENU, label: __('Products'), path: '../products' }
]

export default function Header() {
  const navigate = useNavigate()

  return (
    <AntHeader className="flex h-16 items-center justify-between bg-transparent py-5">
      {/* <div className={cls.sidebarLogo} title="Bit CRM Logo">
        <img alt="logo icon" src={logo} width={37} />
        <Fade is={!isSidebarCollapsed}>
          <LogoText color={isDarkTheme ? '#fff' : '#000'} w={65} />
        </Fade>
      </div> */}
      <div>{__('Bit CRM')}</div>
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
        <Button
          className="h-10 w-10 shadow-none"
          classNames={{ icon: ' flex items-center' }}
          icon={<LuSettings className="text-gray-500" size={18} />}
          onClick={() => navigate('/settings')}
          shape="circle"
        />
      </div>
    </AntHeader>
  )
}
