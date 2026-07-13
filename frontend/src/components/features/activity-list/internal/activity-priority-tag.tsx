import { __ } from '@common/helpers/i18nWrap'
import { type ActivityPriority } from '@features/activity-list/shared/activity-types'
import { Tag } from 'antd'

import { PRIORITIES } from '../shared/activity-constants'

interface ActivityPriorityTagProps {
  priority?: ActivityPriority
}

const PRIORITY_TAG = {
  [PRIORITIES.HIGH]: { color: 'red', label: __('High') },
  [PRIORITIES.LOW]: { color: 'blue', label: __('Low') },
  [PRIORITIES.MEDIUM]: { color: 'orange', label: __('Medium') }
}

export default function ActivityPriorityTag({ priority }: ActivityPriorityTagProps) {
  if (!priority || !PRIORITY_TAG[priority]) {
    return
  }

  const { color, label } = PRIORITY_TAG[priority]

  return <Tag color={color}>{label}</Tag>
}
