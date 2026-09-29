import { Typography } from 'antd'
import { type ReactNode } from 'react'

interface SettingsPageHeaderProps {
  children?: ReactNode
  title: ReactNode
}

/* Fixed h-14 from `sm` up so SettingsTabs can dock its tab bar directly beneath with
   top-14. Below that the title and its actions are allowed to wrap onto a second line --
   the height then varies, which is why SettingsTabs stops sticking at the same
   breakpoint rather than docking at a now-wrong offset. */
export default function SettingsPageHeader({ children, title }: SettingsPageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex min-h-14 shrink-0 flex-wrap items-center gap-2 rounded-t-md border-0 border-b border-solid border-[#E5E3FE] bg-white px-4 py-2 sm:h-14 sm:flex-nowrap sm:py-0 dark:border-neutral-700 dark:bg-neutral-900">
      <Typography.Title className="mb-0" level={2}>
        {title}
      </Typography.Title>
      {children}
    </div>
  )
}
