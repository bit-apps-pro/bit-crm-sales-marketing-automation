import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import SearchInput from '@utilities/search-input'
import { Button, Select, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

import useNotes from './data/use-notes'
import NotesSkeleton from './internal/notes-skeleton'
import { DEFAULT_PAGE, DEFAULT_PER_PAGE, RECENT_FIRST, SORT_OPTIONS } from './shared/constants'
import useNoteStore from './state/use-note-store'
import NoteCreateModal from './ui/note-create-modal'
import NoteEditModal from './ui/note-edit-modal'
import NoteList from './ui/note-list'

interface NotesProps {
  entityId: number
  fields: FieldItem[]
  module: string
}

const generateFieldOptions = (fields: FieldItem[]) => {
  const options: { label: string; value: string }[] = []

  fields.forEach(field => {
    if (field.type === 'section') {
      return
    }

    if (field.group_fields) {
      const nestedOptions = generateFieldOptions(Object.values(field.group_fields))
      options.push(...nestedOptions)
    } else {
      options.push({
        label: field.label,
        value: `{${field.field_key}}`
      })
    }
  })

  return options
}

export default function Notes({ entityId, fields, module }: NotesProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useNoteStore()
  const page = searchParams.get('page') || DEFAULT_PAGE
  const perPage = searchParams.get('perPage') || DEFAULT_PER_PAGE
  const sortOrder = searchParams.get('sortOrder') || RECENT_FIRST
  const { isFetchingNotes, isRefetchingNotes, notes, total } = useNotes(
    module,
    entityId,
    page,
    perPage,
    sortOrder,
    searchDebounced
  )

  useDebounce(() => setSearchDebounced(search), 300, [search])

  const handleSortChange = (value: string) => {
    setSearchParams(prev => {
      prev.set('sortOrder', value)
      return prev
    })
  }

  useEffect(() => {
    if (!isFetchingNotes && !isRefetchingNotes && notes?.length === 0 && Number(page) !== 1) {
      setSearchParams(prev => {
        prev.set('page', '1')
        return prev
      })
    }
  }, [isFetchingNotes, isRefetchingNotes, notes?.length, page, setSearchParams])

  return (
    <div className="space-y-5">
      <div className="flex justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={5}>
            {__('Notes')}
          </Typography.Title>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'note_create' })}
          >
            {__('New')}
          </Button>
          <If conditions={isFetchingNotes || isRefetchingNotes}>
            <LoadingOutlined />
          </If>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Select
            className="[&_.ant-select-selection-item]:rounded-full [&_.ant-select-selector]:rounded-full"
            defaultValue={sortOrder}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            style={{ width: 150 }}
          />
          <SearchInput queryKey="search" />
        </div>
      </div>
      {isFetchingNotes ? <NotesSkeleton quantity={3} /> : <NoteList notes={notes} />}
      <NoteCreateModal entityId={entityId} fieldOptions={generateFieldOptions(fields)} module={module} />
      <NoteEditModal fieldOptions={generateFieldOptions(fields)} />
      <If conditions={notes && notes.length > 0}>
        <Pagination total={total} />
      </If>
    </div>
  )
}
