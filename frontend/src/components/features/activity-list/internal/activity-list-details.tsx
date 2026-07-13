import { type ActivityType } from '@features/activity-list/shared/activity-types'
import AttachmentGallery from '@features/attachment-gallery'
import { Typography } from 'antd'

export default function ActivityListDetails({ item }: { item: ActivityType }) {
  return (
    <div>
      <Typography.Text>{item.details}</Typography.Text>
      <AttachmentGallery attachments={item.attachments} />
    </div>
  )
}
