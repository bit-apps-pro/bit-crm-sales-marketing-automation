import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { Typography } from 'antd'

import { type PendingActivityItem } from '../shared/types'

interface ActivityRowProps {
  item: PendingActivityItem
}

export default function ActivityRow({ item }: ActivityRowProps) {
  return (
    <div className="space-y-2 rounded bg-[#FBFBFE] p-2 shadow-sm dark:bg-[#1A1A1A]">
      <Typography.Paragraph className="mb-0 line-clamp-2 text-sm font-medium">
        {item.title}
      </Typography.Paragraph>
      {item.details ? (
        <Typography.Paragraph className="mb-0 mt-0.5 line-clamp-3 text-xs capitalize text-[#9090A8] dark:text-[#9090A8]">
          {item.details}
        </Typography.Paragraph>
      ) : undefined}
      <div className="mt-1 flex justify-between text-xs text-[#9090A8]">
        <div className="space-x-0.5">
          <Typography.Text className="text-xs text-[#9090A8]">{__('Due:')}</Typography.Text>
          <Typography.Text className="text-xs">
            {item.due_date ? formatDateTime(item.due_date) : __('—')}
          </Typography.Text>
        </div>
        <div className="space-x-0.5">
          <Typography.Text className="text-xs text-[#9090A8]">{__('Assignee:')}</Typography.Text>
          <Typography.Text className="text-xs">{item.assignee ?? __('Unassigned')}</Typography.Text>
        </div>
      </div>
    </div>
  )
}
