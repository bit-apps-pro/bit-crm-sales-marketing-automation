export interface AttachmentType {
  created_at: string
  created_by: number
  created_by_name?: string
  file_name: string
  file_size_in_bytes: number
  id?: number
  media_id: number
  media_url: string
  mime: string
}

export interface AttachmentsIndexType {
  current_page: number
  data: AttachmentType[]
  per_page: number
  total: number
}
