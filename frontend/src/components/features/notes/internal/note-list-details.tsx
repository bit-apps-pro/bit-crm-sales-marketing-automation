import AttachmentGallery from '@features/attachment-gallery'
import { Typography } from 'antd'

import { type NoteType } from '../shared/note-types'

export default function NoteListDetails({ item }: { item: NoteType }) {
  return (
    <div>
      <Typography.Text>
        <span dangerouslySetInnerHTML={{ __html: item.details }} />
      </Typography.Text>
      <AttachmentGallery attachments={item.attachments} />
    </div>
  )
}
