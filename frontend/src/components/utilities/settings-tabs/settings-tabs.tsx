import { cn } from '@common/helpers/globalHelpers'
import { Tabs, type TabsProps } from 'antd'

/* top-14 equals the h-14 of SettingsPageHeader so the tab bar docks right under it. */
const stickyTabBar =
  '[&>.ant-tabs-nav]:sticky [&>.ant-tabs-nav]:top-14 [&>.ant-tabs-nav]:z-10 [&>.ant-tabs-nav]:bg-white dark:[&>.ant-tabs-nav]:bg-neutral-900'

export default function SettingsTabs({ className, ...props }: TabsProps) {
  return <Tabs className={cn([stickyTabBar, 'mx-6 my-2 grow', className])} {...props} />
}
