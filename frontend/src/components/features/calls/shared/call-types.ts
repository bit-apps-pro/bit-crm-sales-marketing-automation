import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'

export interface CallType {
  assigned_to: number
  assignee?: string
  attachments: Attachment[]
  details: string
  due_date: string
  entity_id?: number
  entity_name?: string
  id?: number
  is_completed?: boolean
  is_shared: boolean
  module?: string
  notes_count: number
  title: string
  type: 'call'
}

export interface FieldOptionsType {
  label: string
  value: string
}

export interface CallsIndexType {
  current_page: number
  data: CallType[]
  per_page: number
  total: number
}
