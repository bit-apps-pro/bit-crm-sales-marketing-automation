import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import DownloadMedia from '@utilities/download-media'
import If from '@utilities/If'
import { Button, Popconfirm, Tooltip } from 'antd'
import { LuDownload, LuTrash2 } from 'react-icons/lu'

import useDeleteAttachment from '../data/use-delete-attachment'
import { type AttachmentType } from '../shared/attachment-types'

interface AttachmentListActionsProps {
  attachment: AttachmentType
  id: number
}

export default function AttachmentListActions({ attachment, id }: AttachmentListActionsProps) {
  const { deleteAttachment, isDeletingAttachment } = useDeleteAttachment()

  const handleDelete = async () => {
    await deleteAttachment(id)
  }

  return (
    <div className="flex items-center gap-2">
      <If conditions={checkCapability(CAPABILITIES.ATTACHMENT.DELETE)}>
        <Popconfirm
          cancelText={__('Cancel')}
          description={
            <p className="mb-0 max-w-72">
              {__(
                'The attachment will be removed from this record. This can’t be undone, but the file itself stays in your Media Library.'
              )}
            </p>
          }
          okButtonProps={{ danger: true, loading: isDeletingAttachment }}
          okText={__('Delete')}
          onConfirm={handleDelete}
          placement="topRight"
          title={__('Delete this attachment?')}
        >
          <Tooltip title={__('Delete attachment')}>
            <Button danger icon={<LuTrash2 />} size="small" type="link" />
          </Tooltip>
        </Popconfirm>
      </If>

      <DownloadMedia fileName={attachment.file_name} mediaId={attachment.media_id}>
        <Tooltip title={__('Download attachment')}>
          <Button icon={<LuDownload />} size="small" type="link" />
        </Tooltip>
      </DownloadMedia>
    </div>
  )
}
