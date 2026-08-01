export interface ApiSettingsType {
  available: boolean
  baseUrl: string
  enabled: boolean
}

export interface ApiKeyType {
  created: null | number
  lastIp: null | string
  lastUsed: null | number
  name: string
  uuid: string
}

export interface ApiUserRowType {
  email: string
  id: number
  isAdmin: boolean
  keyCount: number
  keys: ApiKeyType[]
  name: string
  profile: string
}

export interface ApiUsersPageType {
  current_page: number
  current_total: number
  data: ApiUserRowType[]
  last_page: number
  pages: number
  per_page: number
  total: number
}

export interface ApiSettingsIndexType {
  settings: ApiSettingsType
  users: ApiUsersPageType
}

export interface CreatedApiKeyType {
  name: string
  password: string
  userName: string
  uuid: string
}
