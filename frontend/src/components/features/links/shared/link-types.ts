export interface LinkType {
  created_at?: string
  created_by?: string
  description: string
  entity_id: number
  id?: number
  link: string
  module: string
  processed_url?: string
  title: string
}

export interface LinksIndexType {
  current_page: number
  data: LinkType[]
  per_page: number
  total: number
}
