import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Tooltip } from 'antd'
import { useAtom } from 'jotai'
import { LuMoon, LuSun } from 'react-icons/lu'

/** A single icon button showing the theme it switches to, sized like the header's other icon buttons. */
export default function ThemeToggle() {
  const [{ isDarkTheme }, setAppConfig] = useAtom($appConfig)
  const label = isDarkTheme ? __('Switch to light mode') : __('Switch to dark mode')

  const toggleTheme = () =>
    setAppConfig(prv => ({
      ...prv,
      isDarkTheme: !prv.isDarkTheme
    }))

  return (
    <Tooltip title={label}>
      <Button
        aria-label={label}
        className="h-10 w-10 shadow-none"
        classNames={{ icon: 'flex items-center' }}
        icon={
          isDarkTheme ? (
            <LuSun className="text-gray-500" size={18} />
          ) : (
            <LuMoon className="text-gray-500" size={18} />
          )
        }
        onClick={toggleTheme}
        shape="circle"
      />
    </Tooltip>
  )
}
