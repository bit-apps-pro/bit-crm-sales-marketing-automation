import { __ } from '@common/helpers/i18nWrap'
import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'
import DownloadMedia from '@utilities/download-media'
import { Button, Typography } from 'antd'
import { LuDownload, LuEye } from 'react-icons/lu'

interface AttachmentGalleryImageProps {
  attachment: Attachment
  imageUrls: string[]
  setCurrentImageIndex: (index: number) => void
  setIsPreviewVisible: (visible: boolean) => void
}

export default function AttachmentGalleryImage({
  attachment,
  imageUrls,
  setCurrentImageIndex,
  setIsPreviewVisible
}: AttachmentGalleryImageProps) {
  const setImagePreview = (url: string) => {
    const index = imageUrls.indexOf(url)

    if (index === -1) return

    setCurrentImageIndex(index)
    setIsPreviewVisible(true)
  }

  return (
    <div className="w-24">
      <div className="group relative h-24 w-full rounded border border-solid border-slate-200 p-1 dark:border-slate-700">
        <img
          alt={attachment.file_name}
          className="h-full w-full object-scale-down"
          src={attachment.media_url}
        />
        <div className="absolute bottom-0 right-0 flex w-full translate-y-5 items-center justify-center rounded-b bg-slate-200 px-2 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-700">
          <DownloadMedia fileName={attachment.file_name} mediaId={attachment.media_id}>
            <Button className="w-6" icon={<LuDownload />} title={__('Download')} type="link" />
          </DownloadMedia>
          <Button
            className="w-6"
            icon={<LuEye />}
            onClick={() => setImagePreview(attachment.media_url)}
            title={__('View')}
            type="link"
          />
        </div>
      </div>
      <Typography.Paragraph
        className="mb-0 mt-1 text-center text-xs"
        ellipsis
        title={attachment.file_name}
      >
        {attachment.file_name}
      </Typography.Paragraph>
    </div>
  )
}
