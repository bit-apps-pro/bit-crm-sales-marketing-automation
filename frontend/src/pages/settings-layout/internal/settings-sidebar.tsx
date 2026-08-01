import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { Layout, Menu, type MenuProps } from 'antd'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

const { Sider } = Layout

const navGroups = [
  {
    items: [
      {
        capability: CAPABILITIES.SETTING.GENERAL,
        label: __('General Settings'),
        path: '../settings/general-settings'
      }
    ],
    title: __('General')
  },
  {
    items: [
      {
        capability: CAPABILITIES.SETTING.LEAD,
        label: __('Lead Settings'),
        path: '../settings/lead-settings'
      },
      {
        capability: CAPABILITIES.SETTING.CONTACT,
        label: __('Contact Settings'),
        path: '../settings/contact-settings'
      },
      {
        capability: CAPABILITIES.SETTING.COMPANY,
        label: __('Company Settings'),
        path: '../settings/company-settings'
      },
      {
        capability: CAPABILITIES.SETTING.DEAL,
        label: __('Deal Settings'),
        path: '../settings/deal-settings'
      },
      {
        capability: CAPABILITIES.SETTING.PRODUCT,
        label: __('Product Settings'),
        path: '../settings/product-settings'
      },
      {
        capability: CAPABILITIES.SETTING.INVOICE,
        label: __('Invoice Settings'),
        path: '../settings/invoice-settings'
      }
    ],
    title: __('Entities')
  },
  {
    items: [
      {
        capability: CAPABILITIES.SETTING.IMAP,
        label: __('IMAP Settings'),
        path: '../settings/imap-settings'
      },
      {
        capability: CAPABILITIES.SETTING.SMTP,
        label: __('SMTP Settings'),
        path: '../settings/smtp-settings'
      }
    ],
    title: __('Communication')
  },
  {
    items: [
      {
        capability: CAPABILITIES.SETTING.INTEGRATION,
        label: __('Woo Commerce'),
        path: '../settings/woo-settings'
      },
      {
        capability: CAPABILITIES.SETTING.INTEGRATION,
        label: __('Bit Form'),
        path: '../settings/bit-form-settings'
      },
      {
        capability: CAPABILITIES.SETTING.INTEGRATION,
        label: __('Others'),
        path: '../settings/others-integrations-settings'
      }
    ],
    title: __('Integrations')
  },
  {
    items: [
      {
        capability: CAPABILITIES.SETTING.CURRENCY,
        label: __('Currency Settings'),
        path: '../settings/currencies'
      },
      {
        capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
        label: __('Data management'),
        path: '../settings/data-management'
      },
      {
        capability: CAPABILITIES.SETTING.PORTAL,
        label: __('Portal Settings'),
        path: '../settings/portal-settings'
      },
      {
        capability: CAPABILITIES.SETTING.USER,
        label: __('CRM Users'),
        path: '../settings/crm-users'
      }
    ],
    title: __('System')
  }
]

const navItems = navGroups.flatMap(group => group.items)

const menuItems: MenuProps['items'] = navGroups
  .map(group => ({
    children: group.items
      .filter(item => checkCapability(item.capability))
      .map(item => ({
        key: item.path.split('/').at(-1) as string,
        label: item.label
      })),
    key: group.title as string,
    label: group.title,
    type: 'group' as const
  }))
  .filter(group => group.children.length > 0)

const accessibleFirstNavItem = navItems.find(link => checkCapability(link.capability))

export default function SettingsSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/settings' && accessibleFirstNavItem !== undefined) {
      navigate(accessibleFirstNavItem.path, { replace: true })
    }
  }, [location.pathname, navigate])

  const pathKey = location.pathname.split('/').at(-1) ?? ''

  return (
    <Sider className="w-52 rounded-l-md border border-solid border-[#EBEAFF] bg-white px-1 py-2 dark:border-neutral-700 dark:bg-neutral-900">
      <Menu
        className="border-0 bg-transparent [&_.ant-menu-item]:rounded-full"
        items={menuItems}
        mode="inline"
        onSelect={({ key }) => {
          const item = navItems.find(i => i.path.split('/').at(-1) === key)
          if (item) navigate(item.path)
        }}
        selectedKeys={[pathKey]}
      />
    </Sider>
  )
}
