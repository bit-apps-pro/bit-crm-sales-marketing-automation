import { $appConfig } from '@common/globalStates'
import { cn } from '@common/helpers/globalHelpers'
import { useAtom } from 'jotai'
import { LuMoon, LuSun } from 'react-icons/lu'

export default function ThemeToggle() {
  const [{ isDarkTheme }, setAppConfig] = useAtom($appConfig)

  const toggleTheme = () =>
    setAppConfig(prv => ({
      ...prv,
      isDarkTheme: !prv.isDarkTheme
    }))

  return (
    <button
      className="relative flex h-10 w-20 cursor-pointer items-center justify-center rounded-full border border-solid border-[#E5E3FE] bg-white transition-colors duration-300 focus:outline-none focus:ring-0 dark:border-[#3F3A86] dark:bg-transparent"
      onClick={toggleTheme}
    >
      <div className="absolute inset-0 flex items-center justify-between px-3">
        <LuSun className={isDarkTheme ? 'text-gray-400' : 'text-gray-500'} size={16} />
        <LuMoon className={isDarkTheme ? 'text-gray-500' : 'text-gray-400'} size={16} />
      </div>
      <div
        className={cn([
          'absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md transition-all duration-300',
          isDarkTheme ? 'left-11' : 'left-1'
        ])}
      >
        {isDarkTheme ? (
          <LuMoon className="text-white" size={16} />
        ) : (
          <LuSun className="text-white" size={16} />
        )}
      </div>
    </button>
  )
}
