import { INVOICE_STATUS_OPTIONS } from '@common/constants/invoice-status'
import { __ } from '@common/helpers/i18nWrap'
import { Select } from 'antd'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

export default function InvoiceStatusFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusesParam = searchParams.get('statuses')
  const selectedStatuses = useMemo(() => {
    return statusesParam ? statusesParam.split(',').filter(Boolean) : []
  }, [statusesParam])
  const handleFilterChange = (statusesValue: string[]) => {
    setSearchParams(prev => {
      if (statusesValue.length === 0) {
        prev.delete('statuses')
      } else {
        prev.set('statuses', statusesValue.join(','))
      }
      return prev
    })
  }
  return (
    <Select
      allowClear
      className="min-w-52 [&_.ant-select-selection-item]:rounded-full [&_.ant-select-selector]:rounded-full"
      maxTagCount="responsive"
      mode="multiple"
      onChange={handleFilterChange}
      options={INVOICE_STATUS_OPTIONS}
      placeholder={__('Filter With Statuses')}
      value={selectedStatuses}
    />
  )
}
