import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Dropdown, type DropdownProps, type MenuProps } from 'antd'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { LuEllipsisVertical, LuMoon, LuSettings, LuSun } from 'react-icons/lu'
import { NavLink } from 'react-router'

const getMenuItems = (isDarkTheme: boolean): MenuProps['items'] => [
  {
    icon: <LuSettings size={16} />,
    key: 'settings',
    label: (
      <NavLink className="text-sm font-bold" to="/settings">
        {__('Settings')}
      </NavLink>
    )
  },
  { type: 'divider' as const },
  {
    icon: isDarkTheme ? <LuMoon size={16} /> : <LuSun size={16} />,
    key: 'theme',
    label: (
      <Button className="px-0 text-sm font-bold" size="small" type="link">
        {isDarkTheme ? __('Dark') : __('Light')}
      </Button>
    )
  }
]

export default function MoreOptionButton() {
  const [{ isDarkTheme }, setAppConfig] = useAtom($appConfig)
  const [open, setOpen] = useState(false)

  const toggleTheme = () =>
    setAppConfig(prv => ({
      ...prv,
      isDarkTheme: !prv.isDarkTheme
    }))

  const handleMenuClick: MenuProps['onClick'] = e => {
    if (e.key === 'theme') {
      toggleTheme()
      return
    }

    setOpen(false)
  }

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setOpen(nextOpen)
    }
  }

  return (
    <Dropdown
      menu={{ items: getMenuItems(isDarkTheme), onClick: handleMenuClick }}
      onOpenChange={handleOpenChange}
      open={open}
      overlayStyle={{ minWidth: 140 }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button className="border border-solid border-black bg-transparent text-black dark:border-white dark:text-white">
        {__('More')} <LuEllipsisVertical />
      </Button>
    </Dropdown>
  )
}
