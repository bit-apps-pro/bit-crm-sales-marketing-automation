import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import {
  BitFormIcon,
  FluentCartIcon,
  McpIcon,
  SureCartIcon,
  WooCommerceIcon
} from '@common/icons/brands'
import { MailIncomingIcon, MailOutgoingIcon } from '@common/icons/mail'
import { Layout, Menu, type MenuProps, Select } from 'antd'
import { useEffect } from 'react'
import {
  LuBuilding2,
  LuDatabase,
  LuDollarSign,
  LuFileUser,
  LuHandshake,
  LuLayers,
  LuMagnet,
  LuPackage,
  LuPlug,
  LuScrollText,
  LuSettings,
  LuSparkles,
  LuUser,
  LuUsers
} from 'react-icons/lu'
import { useLocation, useNavigate } from 'react-router'

const { Sider } = Layout

const navGroups = [
  {
    items: [
      {
        capability: CAPABILITIES.SETTING.GENERAL,
        icon: <LuSettings />,
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
        icon: <LuMagnet />,
        label: __('Lead Settings'),
        path: '../settings/lead-settings'
      },
      {
        capability: CAPABILITIES.SETTING.CONTACT,
        icon: <LuUser />,
        label: __('Contact Settings'),
        path: '../settings/contact-settings'
      },
      {
        capability: CAPABILITIES.SETTING.COMPANY,
        icon: <LuBuilding2 />,
        label: __('Company Settings'),
        path: '../settings/company-settings'
      },
      {
        capability: CAPABILITIES.SETTING.DEAL,
        icon: <LuHandshake />,
        label: __('Deal Settings'),
        path: '../settings/deal-settings'
      },
      {
        capability: CAPABILITIES.SETTING.PRODUCT,
        icon: <LuPackage />,
        label: __('Product Settings'),
        path: '../settings/product-settings'
      },
      {
        capability: CAPABILITIES.SETTING.INVOICE,
        icon: <LuScrollText />,
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
        icon: <MailIncomingIcon />,
        label: __('IMAP Settings'),
        path: '../settings/imap-settings'
      },
      {
        capability: CAPABILITIES.SETTING.SMTP,
        icon: <MailOutgoingIcon />,
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
        icon: <WooCommerceIcon />,
        label: __('Woo Commerce'),
        path: '../settings/woo-settings'
      },
      {
        capability: CAPABILITIES.SETTING.INTEGRATION,
        icon: <FluentCartIcon />,
        label: __('FluentCart'),
        path: '../settings/fluent-cart-settings'
      },
      {
        capability: CAPABILITIES.SETTING.INTEGRATION,
        icon: <SureCartIcon />,
        label: __('SureCart'),
        path: '../settings/surecart-settings'
      },
      {
        capability: CAPABILITIES.SETTING.INTEGRATION,
        icon: <BitFormIcon />,
        label: __('Bit Form'),
        path: '../settings/bit-form-settings'
      },
      {
        capability: CAPABILITIES.SETTING.INTEGRATION,
        icon: <LuLayers />,
        label: __('Others'),
        path: '../settings/others-integrations-settings'
      }
    ],
    title: __('Integrations')
  },
  {
    items: [
      {
        capability: CAPABILITIES.AI.CHAT,
        icon: <LuSparkles />,
        label: __('AI Assistant'),
        path: '../settings/ai-assistant'
      },
      {
        capability: CAPABILITIES.MCP.SERVER,
        icon: <McpIcon />,
        label: __('MCP Server'),
        path: '../settings/mcp-server'
      }
    ],
    title: __('AI')
  },
  {
    items: [
      {
        capability: CAPABILITIES.SETTING.CURRENCY,
        icon: <LuDollarSign />,
        label: __('Currency Settings'),
        path: '../settings/currencies'
      },
      {
        capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
        icon: <LuDatabase />,
        label: __('Data management'),
        path: '../settings/data-management'
      },
      {
        capability: CAPABILITIES.SETTING.PORTAL,
        icon: <LuFileUser />,
        label: __('Portal Settings'),
        path: '../settings/portal-settings'
      },
      {
        capability: CAPABILITIES.SETTING.USER,
        icon: <LuUsers />,
        label: __('CRM Users'),
        path: '../settings/crm-users'
      },
      {
        capability: CAPABILITIES.SETTING.API,
        icon: <LuPlug />,
        label: __('REST API'),
        path: '../settings/api-settings'
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
        icon: item.icon,
        key: item.path.split('/').at(-1) as string,
        label: item.label
      })),
    key: group.title as string,
    label: group.title,
    type: 'group' as const
  }))
  .filter(group => group.children.length > 0)

/* The small-screen counterpart of `menuItems`: same groups, same capability filtering,
   shaped as grouped Select options so both navigations stay in step. */
const selectOptions = navGroups
  .map(group => ({
    label: group.title,
    options: group.items
      .filter(item => checkCapability(item.capability))
      .map(item => ({
        label: (
          <span className="flex items-center gap-2">
            {item.icon}
            {item.label}
          </span>
        ),
        value: item.path.split('/').at(-1) as string
      }))
  }))
  .filter(group => group.options.length > 0)

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

  const handleNavigate = (key: string) => {
    const item = navItems.find(i => i.path.split('/').at(-1) === key)
    if (item) navigate(item.path)
  }

  /*
    Two presentations of the same nav.

    The Sider is a fixed 200px column (antd sets that inline, which is why the old `w-52`
    class never took effect). Below `lg` that leaves too little room for the settings form
    beside it, so the Sider is hidden outright and a full-width Select takes over above
    the content. Hiding with `hidden lg:block` rather than antd's `breakpoint` prop keeps
    the switch on the same Tailwind breakpoint as the surrounding layout, and leaves the
    desktop rendering untouched.

    The Select is grouped to match the menu's sections, so the two read the same way.
  */
  return (
    <>
      <Sider className="hidden rounded-s-md border border-solid border-[#EBEAFF] bg-white px-1 py-2 lg:block dark:border-neutral-700 dark:bg-neutral-900">
        <Menu
          className="border-0 bg-transparent [&_.ant-menu-item]:rounded-full"
          items={menuItems}
          mode="inline"
          onSelect={({ key }) => handleNavigate(key)}
          selectedKeys={[pathKey]}
        />
      </Sider>

      <div className="mb-3 lg:hidden">
        <Select
          className="w-full"
          onChange={handleNavigate}
          options={selectOptions}
          size="large"
          value={pathKey}
        />
      </div>
    </>
  )
}
