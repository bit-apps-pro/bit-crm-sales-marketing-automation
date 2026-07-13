import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type TagResType } from '@pages/lead/shared/lead-types'
import { type QueryObserverResult } from '@tanstack/react-query'
import { type SetStateAction } from 'jotai'
import { type Dispatch } from 'react'

export interface LeadCreateFormProps {
  columnSettings?: boolean | { column_size: number }
  fields: FieldItem[]
  newTagTitles: string[]
  refetchTags: () => Promise<QueryObserverResult<TagResType, Error>>
  setNewTagTitles: Dispatch<SetStateAction<string[]>>
  setTagIds: Dispatch<SetStateAction<number[]>>
  tagIds: number[]
}
