import { List } from 'antd'

import NoteListActionCreatedBy from '../internal/note-list-action-created-by'
import NoteListActionDate from '../internal/note-list-action-date'
import NoteListActionMore from '../internal/note-list-action-more'
import NoteListDetails from '../internal/note-list-details'
import { type NoteType } from '../shared/note-types'

export default function NoteList({ notes }: { notes?: NoteType[] }) {
  return (
    <List
      dataSource={notes}
      itemLayout="vertical"
      renderItem={item => (
        <List.Item
          actions={[
            <NoteListActionCreatedBy createdBy={item.created_by} key="created-by" />,
            <NoteListActionDate date={item.created_at} key="date" />,
            <NoteListActionMore id={item.id || 0} key="more" />
          ]}
          className="mb-2 rounded bg-slate-50 p-3 dark:bg-neutral-800"
          styles={{
            actions: {
              alignItems: 'center',
              display: 'flex'
            }
          }}
        >
          <List.Item.Meta description={<NoteListDetails item={item} />} title={item.title} />
        </List.Item>
      )}
    />
  )
}
