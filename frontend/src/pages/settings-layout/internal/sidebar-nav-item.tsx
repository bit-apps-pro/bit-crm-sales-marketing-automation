import { cn } from '@common/helpers/globalHelpers'
import { motion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router'

interface SidebarNavProps {
  props: {
    icon?: JSX.Element
    label: JSX.Element | string
    path: string
  }
}

export default function SidebarNavItem({ props: { icon, label, path } }: SidebarNavProps) {
  const location = useLocation()

  const isActive = () => {
    const pathLastItem = location.pathname.split('/').at(-1)

    let locationPath = location.pathname

    if (!Number.isNaN(Number(pathLastItem))) {
      locationPath = location.pathname.split('/').slice(0, -1).join('/')
    }

    return locationPath == path.replace('..', '')
  }

  return (
    <NavLink
      className={cn([
        'relative z-0 flex items-center rounded-full bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out',
        isActive()
          ? 'text-white'
          : 'hover:bg-black/5 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-white'
      ])}
      to={path}
    >
      {
        <>
          {icon}
          {label}
          {isActive() && (
            <motion.span
              className="absolute inset-0 z-[-1] h-full w-full rounded-full bg-primary shadow-sm"
              layoutId="settings-nav-item-active"
            />
          )}
        </>
      }
    </NavLink>
  )
}
