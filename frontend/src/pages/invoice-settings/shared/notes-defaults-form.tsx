import { __ } from '@common/helpers/i18nWrap'
import QuillEditor from '@features/quill-editor'
import { MINIMAL_TOOLBAR_CONFIG } from '@features/quill-editor/shared/toolbar-configs'
import { type SectionType } from '@pages/invoice-create/shared/invoice-create-types'
import { resolveSections } from '@pages/invoice-create/state/use-invoice-create-store'
import { Button, Typography } from 'antd'
import { useState } from 'react'

export interface NotesDefaults {
  bottom_section_notes: SectionType[]
  top_section_notes: SectionType[]
}

interface NotesDefaultsFormProps {
  defaults?: Partial<NotesDefaults>
  description: string
  isSaving: boolean
  onSave: (notes: NotesDefaults) => void
}

/** The note sections a new invoice or quote starts with; shared by both settings pages. */
export default function NotesDefaultsForm({
  defaults,
  description,
  isSaving,
  onSave
}: NotesDefaultsFormProps) {
  const [notes, setNotes] = useState<NotesDefaults>(() => ({
    bottom_section_notes: resolveSections('bottom', defaults?.bottom_section_notes),
    top_section_notes: resolveSections('top', defaults?.top_section_notes)
  }))

  const updateNote = (key: keyof NotesDefaults, index: number, change: Partial<SectionType>) => {
    setNotes(prev => ({
      ...prev,
      [key]: prev[key].map((note, noteIndex) => (noteIndex === index ? { ...note, ...change } : note))
    }))
  }

  const groups = [
    {
      hint: __('Shown above the line items.'),
      key: 'top_section_notes',
      title: __('Top of the document')
    },
    {
      hint: __('Shown below the totals.'),
      key: 'bottom_section_notes',
      title: __('Bottom of the document')
    }
  ] as const

  // Full width like General Settings; each group is a card with a title bar, like the
  // payment settings. Section names rename in place, as on the invoice/quote form.
  return (
    <div>
      <div className="space-y-4">
        {groups.map(group => (
          <div
            className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900"
            key={group.key}
          >
            <div className="border-0 border-b border-solid border-[#EBEAFF] px-6 py-3 dark:border-neutral-700">
              <Typography.Title className="mb-0" level={5}>
                {group.title}
              </Typography.Title>
              <Typography.Text className="block text-sm" type="secondary">
                {group.hint}
              </Typography.Text>
            </div>
            <div className="space-y-4 px-6 py-4">
              {notes[group.key].map((note, index) => (
                <div key={index}>
                  <Typography.Text
                    editable={{
                      onChange: label => updateNote(group.key, index, { label }),
                      triggerType: ['icon', 'text']
                    }}
                  >
                    {note.label}
                  </Typography.Text>
                  <QuillEditor
                    defaultValue={note.value}
                    onChange={value => updateNote(group.key, index, { value })}
                    toolbarConfig={MINIMAL_TOOLBAR_CONFIG}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-200 pb-2 pt-6 dark:border-gray-700">
        <Typography.Text className="text-sm" type="secondary">
          {description}
        </Typography.Text>
        <Button
          className="rounded-full"
          loading={isSaving}
          onClick={() => onSave(notes)}
          size="middle"
          type="primary"
        >
          {__('Save Changes')}
        </Button>
      </div>
    </div>
  )
}
