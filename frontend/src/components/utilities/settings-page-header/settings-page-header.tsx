import { Typography } from 'antd'
import { type ReactNode } from 'react'

interface SettingsPageHeaderProps {
  children?: ReactNode
  title: ReactNode
}

/* Fixed h-14 so SettingsTabs can dock its tab bar directly beneath with top-14. */
export default function SettingsPageHeader({ children, title }: SettingsPageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-t-md border-0 border-b border-solid border-[#E5E3FE] bg-white px-4 dark:border-neutral-700 dark:bg-neutral-900">
      <Typography.Title className="mb-0" level={2}>
        {title}
      </Typography.Title>
      {children}
    </div>
  )
}
