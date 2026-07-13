import { formatDate } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import useInvoiceTerms from '@pages/invoice-create/data/use-invoice-terms'
import { Typography } from 'antd'
import { useMemo } from 'react'

import { type InvoicePreviewData } from '../shared/invoice-preview-types'

interface InvoiceInfoPreviewProps {
  data: InvoicePreviewData
  logoUrl?: string
}

export default function InvoiceInfoPreview({ data, logoUrl }: InvoiceInfoPreviewProps) {
  const { terms } = useInvoiceTerms()

  const term = useMemo(
    () => terms?.find(t => t.value === data.invoiceTermKey),
    [data.invoiceTermKey, terms]
  )

  const prefix = data.invoicePrefix ? `${data.invoicePrefix}-` : ''
  const displayNumber = data.invoiceNumber ? `${prefix}${data.invoiceNumber}` : `${prefix}{id}`

  return (
    <div className="grid grid-cols-2 items-center">
      <div>{logoUrl && <img alt={__('Business Logo')} className="w-32" src={logoUrl} />}</div>
      <div className="text-right">
        <Typography.Title>{__('INVOICE')}</Typography.Title>
        <div className="grid grid-cols-2">
          <Typography.Text>{__('Invoice Number ')}</Typography.Text>
          <Typography.Text>{displayNumber}</Typography.Text>
          <Typography.Text>{__('Date: ')}</Typography.Text>
          <Typography.Text>{data.invoiceDate ? formatDate(data.invoiceDate) : '-'}</Typography.Text>
          <Typography.Text>{__('Due Date:')}</Typography.Text>
          <Typography.Text>{data.dueDate ? formatDate(data.dueDate) : '-'}</Typography.Text>
          <Typography.Text>{__('Terms:')}</Typography.Text>
          <Typography.Text>{term?.label || '-'}</Typography.Text>
        </div>
      </div>
    </div>
  )
}
