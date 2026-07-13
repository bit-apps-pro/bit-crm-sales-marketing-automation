import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type Order } from '@features/form-builder/shared/field-types'
import { type ContactType } from '@pages/contact/shared/contact-types'
import { type TagItemType } from '@pages/tags/shared/tag-types'
import { type RowSelectionState } from '@tanstack/react-table'
import { type FormInstance } from 'antd'
import { type SetStateAction } from 'jotai'
import { type Dispatch } from 'react'

export interface ContactBulkOperationsPropsType {
  selectedIds: number[]
  setSelectedIds: Dispatch<SetStateAction<Record<number, boolean>>>
}

export interface ContactTagsPropsType {
  activeTag: number[]
  setActiveTag: (tagId: number) => void
}

export interface CreateTagModalPropsType {
  isStoringTag: boolean
  onStoreTag: (form: FormInstance) => Promise<void>
  setTagModalActive: Dispatch<SetStateAction<boolean>>
  tagModalActive: boolean
}

export interface EditTagModalPropsType {
  editTagModalActive: boolean
  isUpdatingTag: boolean
  onUpdateTag: (tagId: TagItemType['id'], form: FormInstance) => Promise<void>
  setEditTagModalActive: Dispatch<SetStateAction<boolean>>
  tagId: TagItemType['id']
  tagTitle: string
}

export interface ExportContactsPropsType {
  customFields: FieldItem[]
  systemDefinedFields: FieldItem[]
  totalContacts?: number
}

export interface ImportContactsPropsType {
  customFields: FieldItem[]
  systemDefinedFields: FieldItem[]
}

export interface ContactsColumnsPayloadType {
  columnVisibility: Record<string, boolean>
  contacts: ContactType[]
  fields: FieldItem[]
  handleSortFilterChange: Dispatch<SetStateAction<{ desc: boolean; id: string }[]>>
  selectedIds: RowSelectionState
  setColumnVisibility: Dispatch<SetStateAction<Record<string, boolean>>>
  setSelectedIds: Dispatch<SetStateAction<RowSelectionState>>
  sorting: { desc: boolean; id: string }[]
}

export interface ContactFieldsResponseType {
  fields: FieldItem[]
  orders: Order[]
  visible_columns: string[]
}

export interface ContactsPayloadType {
  page: number
  perPage: number
  searchTerm: string
  sortBy: string
  sortOrder: string
}

export interface ContactsResponseType {
  contacts: ContactType[]
  totalContacts: number
}

export type UpdateContactTableSettingsPayloadType =
  | {
      setting_key: 'contact_table_columns_order'
      setting_value: Order[]
    }
  | {
      setting_key: 'contact_table_visible_columns'
      setting_value: string[]
    }

export interface UpdateContactTableSettingsResponseType {
  data: {
    fields: FieldItem[]
    orders: Order[]
    visible_columns: string[]
  }
}

export interface ExportContactsPayloadType {
  customFields: Record<string, boolean>
  offset: number
  perPage: number
  systemDefinedFields: Record<string, boolean>
}
