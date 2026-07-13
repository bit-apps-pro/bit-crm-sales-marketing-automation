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
  const action = 'download-media'

  const uri = new URL(`${API_URL}/${action}`)
  uri.searchParams.append('mediaId', mediaId.toString())
  uri.searchParams.append('fileName', fileName)
  uri.searchParams.append('_wpnonce', NONCE)

  return (
    <Link className={className} href={uri.href} rel="noopener noreferrer" target="_blank">
      {children}
    </Link>
  )
}
