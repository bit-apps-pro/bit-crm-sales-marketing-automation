import { cn } from '@common/helpers/globalHelpers'
import { Tabs, type TabsProps } from 'antd'

/* top-14 equals the h-14 of SettingsPageHeader so the tab bar docks right under it.
   That only holds from `sm` up: below it the header wraps to a variable height, so the
   bar sticks at an offset that no longer matches and overlaps the title. It scrolls with
   the page there instead. */
const stickyTabBar =
  'sm:[&>.ant-tabs-nav]:sticky sm:[&>.ant-tabs-nav]:top-14 sm:[&>.ant-tabs-nav]:z-10 sm:[&>.ant-tabs-nav]:bg-white dark:sm:[&>.ant-tabs-nav]:bg-neutral-900'

const withInlineIcons = (items: TabsProps['items']) =>
  items?.map(({ icon, label, ...item }) => ({
    ...item,
    label: icon ? (
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    ) : (
      label
    )
  }))

export default function SettingsTabs({ className, items, ...props }: TabsProps) {
  return (
    <Tabs
      className={cn([stickyTabBar, 'mx-4 my-2 grow sm:mx-6', className])}
      items={withInlineIcons(items)}
      {...props}
    />
  )
}
