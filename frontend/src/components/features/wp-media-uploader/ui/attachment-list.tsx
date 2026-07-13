import { FileOutlined, FilePdfOutlined } from '@ant-design/icons'
import { Button, List, Typography } from 'antd'

import { type Attachment } from '../state/use-attachment-store'
import useAttachmentStore from '../state/use-attachment-store'

const generateAvatar = (attachment: Attachment) => {
  const { mime } = attachment

  if (mime.startsWith('image/')) {
    return (
      <img alt={attachment.file_name} src={attachment.media_url} style={{ height: 50, width: 50 }} />
    )
  }

  if (mime === 'application/pdf') {
    return <FilePdfOutlined style={{ color: 'red', fontSize: 50 }} />
  }

  return <FileOutlined style={{ fontSize: 50 }} />
}

export default function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  const { removeAttachment } = useAttachmentStore()
  return (
    <List
      className="mt-2"
      dataSource={attachments}
      itemLayout="horizontal"
      renderItem={item => (
        <List.Item className="px-0">
          <List.Item.Meta
            avatar={generateAvatar(item)}
            description={
              <Button
                className="p-0"
                danger
                onClick={() => removeAttachment(item.media_id)}
                size="small"
                type="link"
              >
                Remove
              </Button>
            }
            title={
              <Typography.Text ellipsis title={item.file_name}>
                {item.file_name}
              </Typography.Text>
            }
          />
        </List.Item>
      )}
      size="small"
    />
  )
}
