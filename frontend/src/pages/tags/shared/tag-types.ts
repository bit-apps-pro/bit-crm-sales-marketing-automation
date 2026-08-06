import { type Key } from 'react'

export interface CreateModalPropsType {
  pageNo: number
  refetchTags: () => void
}

export interface TagItemType {
  count: number
  id: number
  is_pinned: boolean
  module: string
  slug: string
  title: string
}

export interface TagsDataType {
  data: TagItemType[]
  total: number
}

export interface TagIdType {
  tagId: Key | undefined
}

export interface TableDataType {
  action: TagIdType
  count: number
  key: Key
  module: string
  title: string
}

export interface TagsTablePropsType {
  isFetchingTags: boolean
  isTagsLoading: boolean
  tags: TagItemType[]
}

export interface UpdateTagType {
  id: number
  tagData: TagItemType
}

export interface EditTagDataType {
  id: Key
  module: string
  title: string
}

export interface TagResponse {
  current_page: number
  current_total: number
  data: TagItemType[]
  last_page: number
  pages: number
  per_page: number
  total: number
}
