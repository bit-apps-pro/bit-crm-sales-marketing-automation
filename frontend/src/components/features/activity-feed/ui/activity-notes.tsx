import { __ } from '@common/helpers/i18nWrap'
import useActivityNotes from '@features/activity-feed/data/use-activity-notes'
import { useActivityNoteActions } from '@features/tasks/state/use-activity-note-store'
import { Button, Typography } from 'antd'
import { LuFile, LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import { type ActivityTypeValue } from '../shared/activity-types'
import ActivityNote from './activity-note'
import ActivityNoteCreateModal from './activity-note-create-modal'
import ActivityNotesSkeleton from './activity-notes-skeleton'

interface ActivityNotesProps {
  activityType: ActivityTypeValue
  isValidSelection: boolean
}

export default function ActivityNotes({ activityType, isValidSelection }: ActivityNotesProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const id = Number(searchParams.get('id')) || 0
  const { handleModal } = useActivityNoteActions()

  // Only fetch once the selected activity is confirmed to belong to this feed,
  // otherwise switching tabs with a stale ?id= would load another type's notes.
  const { isLoadingActivityNotes, notes, total } = useActivityNotes(
    activityType,
    isValidSelection ? id : 0
  )

  if (isValidSelection && isLoadingActivityNotes) {
    return <ActivityNotesSkeleton />
  }

  if (!isValidSelection || id === 0) {
    return (
      <div className="border-0 border-l border-solid border-[#EBEAFF] pl-7 dark:border-neutral-700">
        <div className="flex min-h-full flex-col items-center justify-center text-center">
          <Typography.Title className="mb-2" level={5}>
            {__('Select an activity')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {__('Choose an activity from the list to view its notes.')}
          </Typography.Text>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col space-y-5 border-0 border-l border-solid border-[#EBEAFF] pl-7 dark:border-neutral-700">
      <div className="flex min-h-0 flex-1 flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <LuFile />
            <Typography.Text>
              {__('Notes')} ({total})
            </Typography.Text>
          </div>
          <ActivityNoteCreateModal activityType={activityType}>
            <Button
              className="rounded-full"
              icon={<LuPlus />}
              onClick={() => handleModal('open', setSearchParams, { modal: 'create' })}
              size="small"
            >
              {__('Add Note')}
            </Button>
          </ActivityNoteCreateModal>
        </div>
        {total > 0 ? (
          <div
            className="min-h-0 flex-1 space-y-4 overflow-y-auto"
            style={{
              marginInline: '-16px',
              paddingInline: '16px'
            }}
          >
            {notes?.map(note => (
              <ActivityNote key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  )
}
