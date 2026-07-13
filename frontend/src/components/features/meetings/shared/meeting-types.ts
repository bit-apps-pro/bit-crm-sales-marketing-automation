import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'

export interface MeetingType {
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
  title: string
  type: 'meeting'
}

export interface FieldOptionsType {
  label: string
  value: string
}

export interface MeetingsIndexType {
  current_page: number
  data: MeetingType[]
  per_page: number
  total: number
}
