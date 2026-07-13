import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'

export interface NoteType {
  attachments: Attachment[]
  created_at?: string
  created_by?: string
  details: string
  entity_id: number | string
  id?: number
  module: string
  title: string
  type?: string
}

export interface FieldOptionsType {
  label: string
  value: string
}

export interface NotesIndexType {
  current_page: number
  data: NoteType[]
  per_page: number
  total: number
}
