import { cn } from '@common/helpers/globalHelpers'
import { Tag, Typography } from 'antd'
import { LuFile, LuPaperclip, LuUserRound } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import { type ActivityPriority, type ActivityType } from '../shared/activity-types'

const priorityMap: Record<ActivityPriority, string> = {
  high: 'red',
  low: 'blue',
  medium: 'orange'
}

export default function ActivityCard({ activity }: { activity: ActivityType }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const id = searchParams.get('id')
  return (
    <button
      className={cn(
        'block w-full cursor-pointer rounded-[16px] border border-solid bg-white p-4 text-left dark:bg-neutral-900',
        activity.id == Number(id)
          ? 'border-primary dark:border-[#5C4DFF]'
          : 'border-[#EBEAFF] dark:border-neutral-700'
      )}
      key={activity.id}
      onClick={() =>
        setSearchParams(prev => {
          prev.set('id', String(activity.id))
          return prev
        })
      }
      type="button"
    >
      <div className="flex items-center justify-between">
        <Typography.Title className="mb-0 line-clamp-1" level={5}>
          {activity.title}
        </Typography.Title>
        {activity.priority && (
          <Tag className="capitalize" color={priorityMap[activity.priority]}>
            {activity.priority}
          </Tag>
        )}
      </div>
      <Typography.Text className="line-clamp-2">{activity.details}</Typography.Text>
      <div className="mt-4 flex items-center justify-between border-0 border-t border-dashed border-[#EBEAFF] pt-4 dark:border-neutral-700">
        <div className="flex items-center gap-1">
          <LuUserRound />
          <Typography.Text type="secondary">{activity.assignee}</Typography.Text>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <LuPaperclip />
            {activity?.attachments?.length !== undefined && (
              <Typography.Text type="secondary">{activity.attachments.length}</Typography.Text>
            )}
          </div>
          <div className="flex items-center gap-1">
            <LuFile />
            {activity.notes_count !== 0 && (
              <Typography.Text type="secondary">{activity.notes_count}</Typography.Text>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
