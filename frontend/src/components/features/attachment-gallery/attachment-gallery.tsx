import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'
import DownloadMedia from '@utilities/download-media'
import If from '@utilities/If'
import { Image, Space } from 'antd'
import { useMemo, useState } from 'react'

import AttachmentGalleryFile from './ui/attachment-gallery-file'
import AttachmentGalleryImage from './ui/attachment-gallery-image'

export default function AttachmentGallery({ attachments }: { attachments: Attachment[] }) {
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)

  const { imageAttachments, imageUrls } = useMemo(() => {
    const filteredAttachments =
      attachments?.filter(attachment => attachment.mime.startsWith('image/')) || []
    return {
      imageAttachments: filteredAttachments,
      imageUrls: filteredAttachments.map(attachment => attachment.media_url)
    }
  }, [attachments])

  return (
    <If conditions={attachments && attachments.length > 0}>
      <div className="mb-2 mt-3 flex flex-wrap gap-2">
        {attachments?.map(attachment => {
          if (attachment.mime.startsWith('image/')) {
            return (
              <AttachmentGalleryImage
                attachment={attachment}
                imageUrls={imageUrls}
                key={attachment.media_id}
                setCurrentImageIndex={setCurrentImageIndex}
                setIsPreviewVisible={setIsPreviewVisible}
              />
            )
          }

          return <AttachmentGalleryFile attachment={attachment} key={attachment.media_id} />
        })}
      </div>
      <Image.PreviewGroup
        items={imageUrls}
        preview={{
          current: currentImageIndex,
          onChange: current => setCurrentImageIndex(current),
          onVisibleChange: visible => {
            setIsPreviewVisible(visible)
          },
          toolbarRender: (_, { actions: { onActive, onZoomIn, onZoomOut }, transform: { scale } }) => (
            <Space
              className="space-x-5 rounded-[100px] bg-black/20 px-8 py-2 text-lg dark:bg-white/10"
              size={12}
            >
              <LeftOutlined onClick={() => onActive?.(-1)} />
              <RightOutlined onClick={() => onActive?.(1)} />
              {imageAttachments[currentImageIndex] && (
                <DownloadMedia
                  className="text-inherit"
                  fileName={imageAttachments[currentImageIndex].file_name}
                  mediaId={imageAttachments[currentImageIndex].media_id}
                >
                  <DownloadOutlined className="text-lg" />
                </DownloadMedia>
              )}
              <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
              <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
            </Space>
          ),
          visible: isPreviewVisible
        }}
      />
    </If>
  )
}
