import { type ActivityPriority } from '@features/activity-feed/shared/activity-types'
import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'

type ActivityType = 'call' | 'meeting' | 'task'

export interface Activity {
  assigned_to: number
  assignee?: string
  attachments: Attachment[]
  details?: string
  due_date: string
  entity_id?: number
  entity_name?: string
  id: number
  is_completed: boolean
  is_shared?: boolean
  module?: string
  notes_count: number
  priority: ActivityPriority
  title: string
  type: ActivityType
}
