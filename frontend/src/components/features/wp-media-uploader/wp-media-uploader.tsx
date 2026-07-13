import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button } from 'antd'
import { LuPaperclip } from 'react-icons/lu'

import useAttachmentStore from './state/use-attachment-store'
import AttachmentList from './ui/attachment-list'

export interface WPMediaAttachment {
  filename: string
  filesizeInBytes: number
  id: number
  mime: string
  url: string
}

interface MediaItem {
  file_name: string
  file_size_in_bytes: number
  media_id: number
  media_url: string
  mime: string
}

export default function WpMediaUploader({ buttonText }: { buttonText?: string }) {
  const { addAttachments, attachments: storedAttachments } = useAttachmentStore()

  const openMediaLibrary = () => {
    const mediaFrame = window.wp.media({
      button: { text: 'Attach selected files' },
      multiple: true,
      title: __('Select or Upload Files')
    })

    mediaFrame.on('select', () => {
      const attachments = mediaFrame.state().get('selection').toJSON()

      const items = attachments
        .filter((attachment: WPMediaAttachment) => {
          return !storedAttachments.some((item: MediaItem) => item.media_id === attachment.id)
        })
        .map((attachment: WPMediaAttachment) => ({
          file_name: attachment.filename,
          file_size_in_bytes: attachment.filesizeInBytes,
          media_id: attachment.id,
          media_url: attachment.url,
          mime: attachment.mime
        }))

      addAttachments(items)
    })

    mediaFrame.open()
  }

  return (
    <div>
      <Button icon={<LuPaperclip />} onClick={openMediaLibrary}>
        {buttonText || __('Add Attachments')}
      </Button>
      <If conditions={storedAttachments && storedAttachments.length > 0}>
        <AttachmentList attachments={storedAttachments} />
      </If>
    </div>
  )
}
