import { __ } from '@common/helpers/i18nWrap'
import DownloadMedia from '@utilities/download-media'
import { Button, Popconfirm } from 'antd'
import { LuDownload, LuTrash2 } from 'react-icons/lu'

import useDeleteAttachment from '../data/use-delete-attachment'
import { type AttachmentType } from '../shared/attachment-types'

interface AttachmentListActionsProps {
  attachment: AttachmentType
  id: number
}

export default function AttachmentListActions({ attachment, id }: AttachmentListActionsProps) {
  const { deleteAttachment } = useDeleteAttachment()

  const handleDelete = async () => {
    await deleteAttachment(id)
  }

  return (
    <div className="flex items-center gap-2">
      <Popconfirm
        cancelText={__('No')}
        okText={__('Yes')}
        onConfirm={handleDelete}
        title={__('Are you sure to delete this?')}
      >
        <Button danger icon={<LuTrash2 />} size="small" type="link" />
      </Popconfirm>
      <DownloadMedia fileName={attachment.file_name} mediaId={attachment.media_id}>
        <Button icon={<LuDownload />} size="small" type="link" />
      </DownloadMedia>
    </div>
  )
}
