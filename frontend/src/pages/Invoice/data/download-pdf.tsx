import config from '@config/config'
import { Typography } from 'antd'

interface DownloadPdfProps {
  children: React.ReactNode
  className?: string
  invoiceId: number
}

const { Link } = Typography

export default function DownloadPdf({ children, className, invoiceId }: DownloadPdfProps) {
  const { API_URL, NONCE } = config
  const action = 'invoices/download'

  const uri = new URL(`${API_URL}/${action}`)
  uri.searchParams.append('id', invoiceId.toString())
  uri.searchParams.append('_wpnonce', NONCE)

  return (
    <Link className={className} href={uri.href} rel="noopener noreferrer" target="_blank">
      {children}
    </Link>
  )
}
