import { FileOutlined, FilePdfOutlined } from '@ant-design/icons'
import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'
import DownloadMedia from '@utilities/download-media'
import { Button, Typography } from 'antd'
import { LuDownload, LuEye } from 'react-icons/lu'

export default function AttachmentGalleryFile({ attachment }: { attachment: Attachment }) {
  return (
    <div className="w-24">
      <div className="group relative h-24 w-full rounded border border-solid border-slate-200 p-1 dark:border-slate-700">
        {attachment.mime === 'application/pdf' ? (
          <FilePdfOutlined className="h-full w-full" style={{ color: 'red', fontSize: 90 }} />
        ) : (
          <FileOutlined className="h-full w-full" style={{ fontSize: 90 }} />
        )}
        <div className="absolute bottom-0 right-0 flex w-full translate-y-5 items-center justify-center rounded-b bg-slate-200 px-2 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-700">
          <DownloadMedia fileName={attachment.file_name} mediaId={attachment.media_id}>
            <Button className="w-6" icon={<LuDownload />} title={__('Download')} type="link" />
          </DownloadMedia>
          <a
            className={cn([
              'flex h-8 w-6 items-center justify-center',
              attachment.mime !== 'application/pdf' && 'hidden'
            ])}
            href={attachment.media_url}
            rel="noreferrer"
            target="_blank"
            title="View"
          >
            <LuEye />{' '}
          </a>
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
