import config from '@config/config'
import { Typography } from 'antd'

interface DownloadMediaProps {
  children: React.ReactNode
  className?: string
  fileName: string
  mediaId: number
}

const { Link } = Typography

export default function DownloadMedia({ children, className, fileName, mediaId }: DownloadMediaProps) {
  const { API_URL, NONCE } = config

  // The free plugin serves attachments from the admin route only; the client
  // portal and its `client-portal/media/download-media` endpoint ship with pro.
  const uri = new URL(`${API_URL}/download-media`)
  uri.searchParams.append('mediaId', mediaId.toString())
  uri.searchParams.append('fileName', fileName)
  uri.searchParams.append('_wpnonce', SERVER_VARIABLES?.nonce || NONCE)

  return (
    <Link className={className} href={uri.href} rel="noopener noreferrer" target="_blank">
      {children}
    </Link>
  )
}
