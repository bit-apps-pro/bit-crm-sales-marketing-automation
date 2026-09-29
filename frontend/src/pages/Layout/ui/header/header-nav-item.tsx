import { cn } from '@common/helpers/globalHelpers'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router'

interface SidebarNavProps {
  props: {
    end?: boolean
    icon?: JSX.Element
    label: JSX.Element | string
    path: string
  }
}

export default function HeaderNavItem({ props: { end, icon, label, path } }: SidebarNavProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn([
          'relative z-0 flex items-center rounded-full bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out',
          isActive ? 'text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white'
        ])
      }
      /* Dashboard is `../`, a prefix of every other route, so without `end` it stays
         highlighted on every page. The item has always carried the flag; it just was not
         forwarded. */
      end={end}
      to={path}
    >
      {({ isActive }) => (
        <>
          {icon}
          {label}
          {isActive && (
            <motion.span
              className="absolute inset-0 z-[-1] h-full w-full rounded-full bg-primary"
              layoutId="header-nav-item-active"
            />
          )}
        </>
      )}
    </NavLink>
  )
}
