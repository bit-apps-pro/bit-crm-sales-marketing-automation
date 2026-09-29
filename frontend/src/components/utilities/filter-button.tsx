import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Tag, Typography } from 'antd'
import { LuFilter } from 'react-icons/lu'

import If from './If'

export default function FilterButton({
  activeFilterCount,
  compact = false,
  title
}: {
  activeFilterCount: number
  /** Below `sm`, drop the text label and keep the icon and count, so the button fits
      beside a header's title and New button on a phone. */
  compact?: boolean
  title?: string
}) {
  const label = title || __('Advanced Filters')

  return (
    <div
      aria-label={compact ? label : undefined}
      className="flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-solid border-[#EBEAFF] bg-white px-1 dark:border-neutral-700 dark:bg-transparent"
      title={compact ? label : undefined}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
        <LuFilter size={18} />
      </div>
      <div
        className={cn(
          'me-2 flex items-center gap-1',
          compact && activeFilterCount === 0 && 'max-sm:hidden'
        )}
      >
        <Typography.Text className={cn('whitespace-nowrap', compact && 'max-sm:hidden')}>
          {label}
        </Typography.Text>
        <If conditions={activeFilterCount > 0}>
          <Tag className="m-0 text-xs" color="blue">
            {activeFilterCount}
          </Tag>
        </If>
      </div>
    </div>
  )
}
