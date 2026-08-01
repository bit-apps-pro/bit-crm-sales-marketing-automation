export interface ImapType {
  encryption?: string
  host?: string
  id?: number
  is_private?: string
  password: string
  platform: string
  port?: number
  title: string
  username: string
  visibility: string
}

export type ImapDataType = Pick<ImapType, 'id' | 'platform' | 'title' | 'username' | 'visibility'> & {
  can_update: boolean
  status: boolean
}
export interface ImapsIndexType {
  data: ImapDataType[]
  per_page: number
  total: number
}
