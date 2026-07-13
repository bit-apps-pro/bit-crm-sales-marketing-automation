import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { type ActivityType } from '@features/activity-list/shared/activity-types'
import AttachmentGallery from '@features/attachment-gallery'
import { Badge, Button, Card, Tag, Tooltip, Typography } from 'antd'
import { useState } from 'react'
import { LuChevronDown, LuChevronUp, LuStickyNote } from 'react-icons/lu'

import ActivityListActionDate from '../internal/activity-list-action-date'
import ActivityListActionMore from '../internal/activity-list-action-more'
import ActivityPriorityTag from '../internal/activity-priority-tag'
import ActivityRelatedEntity from '../internal/activity-related-entity'
import ActivityNotes from './activity-notes'

interface ActivityCardProps {
  activity: ActivityType
  type?: string
}

export default function ActivityCard({ activity, type }: ActivityCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <Card
      classNames={{ header: 'h-auto min-h-0 py-2' }}
      extra={
        <div className="ml-4 flex items-center gap-2">
          <ActivityListActionDate date={activity.due_date} key="date" />
          <div>
            <ActivityListActionMore
              id={activity.id || 0}
              isCompleted={activity.is_completed}
              key="more"
            />
          </div>
        </div>
      }
      title={
        <div className="flex items-center gap-2">
          <Typography.Text className="text-wrap break-words">{activity.title}</Typography.Text>
          <ActivityPriorityTag priority={activity.priority} />
        </div>
      }
    >
      <div className="space-y-5">
        {activity.details && <Typography.Text>{activity.details}</Typography.Text>}
        {activity.attachments && (
          <div className="mb-5">
            <AttachmentGallery attachments={activity.attachments} />
          </div>
        )}
        <div
          className={cn(
            'grid items-center rounded border border-solid border-[#E5E3FE] dark:border-gray-700',
            type === 'page' ? 'grid-cols-4' : 'grid-cols-3'
          )}
        >
          <div className="space-x-1 p-2">
            <Typography.Text className="text-xs" type="secondary">
              {__('Assigned To:')}
            </Typography.Text>
            <Typography.Text className="text-xs font-medium">{activity.assignee}</Typography.Text>
          </div>
          <div className="h-full space-x-1 border-0 border-x border-solid border-[#E5E3FE] p-2 dark:border-gray-700">
            <Typography.Text className="text-xs" type="secondary">
              {__('Status:')}
            </Typography.Text>
            <Tag color={activity.is_completed ? 'green' : 'blue'}>
              {activity.is_completed ? __('Completed') : __('Pending')}
            </Tag>
          </div>
          {type === 'page' && (
            <div className="h-full border-0 border-r border-solid border-[#E5E3FE] p-2 dark:border-gray-700">
              <ActivityRelatedEntity item={activity} />
            </div>
          )}
          <Tooltip placement="topRight" title={isOpen ? __('Collapse') : __('Expand')}>
            <Button
              className="flex w-full items-center justify-between px-2"
              onClick={() => setIsOpen(!isOpen)}
              type="link"
            >
              <div className="flex items-center gap-1">
                <LuStickyNote size={18} />
                <Typography.Text className="text-xs capitalize" type="secondary">
                  {__('Notes')}
                </Typography.Text>
                <Badge color="blue" count={activity.notes_count} />
              </div>
              {isOpen ? <LuChevronUp size={18} /> : <LuChevronDown size={18} />}
            </Button>
          </Tooltip>
        </div>
      </div>
      <ActivityNotes activityId={activity.id} open={isOpen} />
    </Card>
  )
}
