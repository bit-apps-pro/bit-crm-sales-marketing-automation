import { type InvoiceStatus } from '@common/constants/invoice-status'
import { __ } from '@common/helpers/i18nWrap'
import { Button } from 'antd'
import { LuDownload } from 'react-icons/lu'

import { statusLabelMap, statusPillClass } from './public-pay-card-helpers'

export default function PublicPayCardHeader({
  downloadUrl,
  status
}: {
  downloadUrl?: string
  status: InvoiceStatus
}) {
  const statusLabel = statusLabelMap[status]

  return (
    <>
      {statusLabel ? <span className={statusPillClass(status)}>{statusLabel}</span> : <span />}
      {downloadUrl ? (
        <Button href={downloadUrl} icon={<LuDownload />} target="_blank">
          {__('Download')}
        </Button>
      ) : undefined}
    </>
  )
}
