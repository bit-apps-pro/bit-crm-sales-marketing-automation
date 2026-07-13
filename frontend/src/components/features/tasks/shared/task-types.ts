import { type ActivityPriority } from '@features/activity-list/shared/activity-types'
import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'

export interface TaskType {
  assigned_to: number
  assignee?: string
  attachments: Attachment[]
  details: string
  due_date: string
  entity_id?: number
  entity_name?: string
  id?: number
  is_completed?: boolean
  module?: string
  notes_count: number
  priority: ActivityPriority
  title: string
  type: 'task'
}

export interface FieldOptionsType {
  label: string
  value: string
}

export interface TasksIndexType {
  current_page: number
  data: TaskType[]
  per_page: number
  total: number
}
