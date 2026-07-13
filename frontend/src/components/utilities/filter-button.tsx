import { __ } from '@common/helpers/i18nWrap'
import { Tag, Typography } from 'antd'
import { LuFilter } from 'react-icons/lu'

import If from './If'

export default function FilterButton({
  activeFilterCount,
  title
}: {
  activeFilterCount: number
  title?: string
}) {
  return (
    <div className="flex h-10 cursor-pointer items-center gap-1 rounded-full border border-solid border-[#E5E3FE] bg-white px-1 dark:border-[#3F3A86] dark:bg-transparent">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
        <LuFilter size={18} />
      </div>
      <div className="mr-2 flex items-center gap-1">
        <Typography.Text>{title || __('Advanced Filters')}</Typography.Text>
        <If conditions={activeFilterCount > 0}>
          <Tag className="m-0 text-xs" color="blue">
            {activeFilterCount}
          </Tag>
        </If>
      </div>
    </div>
  )
}
