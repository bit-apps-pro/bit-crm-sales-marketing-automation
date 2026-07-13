import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'

export type ActivityTypeValue = 'call' | 'meeting' | 'task'

export type ActivityPriority = 'high' | 'low' | 'medium'

export interface Note {
  note: string
  timestamp: string
}

export interface ActivityType {
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
  notes?: Record<string, Note>
  notes_count: number
  priority?: ActivityPriority
  title: string
  type: ActivityTypeValue
}

export interface FieldOptionsType {
  label: string
  value: string
}

export interface ActivitiesIndexType {
  current_page: number
  data: ActivityType[]
  per_page: number
  total: number
}
