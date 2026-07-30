import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import {
  type ActivityPriority,
  type ActivityTypeValue
} from '@features/activity-feed/shared/activity-types'
import AttachmentGallery from '@features/attachment-gallery'
import { type Activity as ActivityData } from '@features/tasks/shared/types'
import { Divider, Tag, Typography } from 'antd'
import { type ReactNode } from 'react'
import { LuCalendar, LuEye, LuEyeOff, LuFlag, LuPaperclip, LuUser } from 'react-icons/lu'

import ActivityActions from './activity-actions'
import ActivitySkeleton from './activity-skeleton'

interface ActivityProps {
  activity?: ActivityData
  activityType: ActivityTypeValue
  isLoading: boolean
}

interface DetailRow {
  icon: ReactNode
  key: string
  label?: string
  value: ReactNode
}

const PRIORITY_COLORS: Record<ActivityPriority, string> = {
  high: 'red',
  low: 'blue',
  medium: 'orange'
}

export default function Activity({ activity, activityType, isLoading }: ActivityProps) {
  if (isLoading) {
    return <ActivitySkeleton />
  }

  if (!activity || activity.type !== activityType) {
    return (
      <div className="col-span-2 flex h-full flex-1 flex-col items-center justify-center">
        <Typography.Title className="" level={5}>
          {__('Select an activity')}
        </Typography.Title>
        <Typography.Text type="secondary">
          {__('Choose an activity from the list to view its details and attachments.')}
        </Typography.Text>
      </div>
    )
  }

  const isTask = activityType === 'task'

  const details: DetailRow[] = [
    {
      icon: <LuUser />,
      key: 'entity',
      label: activity.module,
      value: <Typography.Text strong>{activity.entity_name}</Typography.Text>
    },
    {
      icon: <LuUser />,
      key: 'assignee',
      label: __('Assigned To'),
      value: <Typography.Text strong>{activity.assignee}</Typography.Text>
    },
    !isTask && {
      icon: activity.is_shared ? <LuEye /> : <LuEyeOff />,
      key: 'shared',
      label: __('Client Portal'),
      value: (
        <Tag color={activity.is_shared ? 'green' : 'default'}>
          {activity.is_shared ? __('Shared') : __('Not shared')}
        </Tag>
      )
    },
    {
      icon: <LuCalendar />,
      key: 'due-date',
      label: __('Due Date'),
      value: (
        <Typography.Text strong>
          {activity.due_date && formatDateTime(activity.due_date)}
        </Typography.Text>
      )
    },
    isTask && {
      icon: <LuFlag />,
      key: 'priority',
      label: __('Priority'),
      value: (
        <Tag className="capitalize" color={PRIORITY_COLORS[activity.priority] ?? 'blue'}>
          {activity.priority}
        </Tag>
      )
    }
  ].filter(Boolean) as DetailRow[]

  return (
    <div className="col-span-2 h-full min-h-0 space-y-7 overflow-y-auto">
      <div className="flex min-w-0">
        <div className="flex w-full min-w-0 items-start gap-2">
          <Typography.Title className="mb-0 min-w-0 flex-1" level={3}>
            {activity?.title}
          </Typography.Title>
          <Tag className="mt-0.5" color={activity?.is_completed ? 'green' : 'orange'}>
            {activity?.is_completed ? __('Completed') : __('Pending')}
          </Tag>
        </div>
        <ActivityActions isCompleted={activity?.is_completed} />
      </div>
      <div>
        <Typography.Text>{activity?.details}</Typography.Text>
      </div>
      <Divider />
      <div className="rounded-lg border border-solid border-[#E5E3FE] p-4 dark:border-neutral-700">
        <dl className="m-0 divide-x-0 divide-y divide-solid divide-[#E5E3FE] dark:divide-neutral-700">
          {details.map(({ icon, key, label, value }) => (
            <div className="grid grid-cols-2 p-2" key={key}>
              <dt className="flex items-center gap-2">
                {icon}
                <Typography.Text className="capitalize" type="secondary">
                  {label}
                </Typography.Text>
              </dt>
              <dd className="m-0">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Divider />
      <div>
        <div className="flex items-center gap-1">
          <LuPaperclip />
          <Typography.Text>{`${__('Attachements')} (${activity?.attachments?.length || 0})`}</Typography.Text>
        </div>
        <div>
          {activity?.attachments && (
            <div className="mb-5">
              <AttachmentGallery attachments={activity.attachments} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
