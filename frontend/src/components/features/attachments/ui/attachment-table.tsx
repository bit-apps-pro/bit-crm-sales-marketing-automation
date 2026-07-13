import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import { cn, formatFileSize } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import DownloadMedia from '@utilities/download-media'
import { Image, Space, Table } from 'antd'
import { type ColumnsType } from 'antd/es/table'
import { useCallback, useMemo, useState } from 'react'
import { LuFile, LuFileImage, LuFileText, LuFileVideo } from 'react-icons/lu'

import AttachmentListActionMore from '../internal/attachment-list-actions'
import { type AttachmentType } from '../shared/attachment-types'

const generateFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <LuFileImage size={20} />
  }

  if (fileType.startsWith('video/')) {
    return <LuFileVideo size={20} />
  }

  if (fileType.startsWith('text/') || fileType.includes('pdf') || fileType.includes('document')) {
    return <LuFileText size={20} />
  }

  return <LuFile size={20} />
}

export default function AttachmentTable({
  attachments,
  loading
}: {
  attachments?: AttachmentType[]
  loading?: boolean
}) {
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

  const setImagePreview = useCallback(
    (url: string) => {
      const index = imageUrls.indexOf(url)
      if (index === -1) return
      setCurrentImageIndex(index)
      setIsPreviewVisible(true)
    },
    [imageUrls]
  )

  const columns: ColumnsType<AttachmentType> = useMemo(
    () => [
      {
        dataIndex: 'title',
        key: 'title',
        render: (_, record) => (
          <div className="flex items-center gap-2">
            {generateFileIcon(record.mime)}
            <div>
              {record.mime.startsWith('image/') ? (
                <button
                  aria-label={__('Preview image')}
                  className={cn('m-0 cursor-pointer border-none bg-transparent p-0 hover:text-blue-500')}
                  onClick={() => setImagePreview(record.media_url)}
                  style={{ background: 'none' }}
                  tabIndex={0}
                  type="button"
                >
                  {record.file_name}
                </button>
              ) : (
                <span>{record.file_name}</span>
              )}
              <div className="text-xs text-gray-500">{formatFileSize(record.file_size_in_bytes)}</div>
            </div>
          </div>
        ),
        title: __('File')
      },
      {
        dataIndex: 'uploader',
        key: 'uploader',
        render: text => text || '-',
        title: __('Uploaded By')
      },
      {
        dataIndex: 'created_at',
        key: 'created_at',
        title: __('Date')
      },
      {
        key: 'actions',
        render: (_, record) => <AttachmentListActionMore attachment={record} id={record.id || 0} />,
        title: __('Actions')
      }
    ],
    [setImagePreview]
  )

  return (
    <>
      <Table
        columns={columns}
        dataSource={attachments}
        loading={loading}
        pagination={false}
        rowKey="id"
        size="small"
      />
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
    </>
  )
}
