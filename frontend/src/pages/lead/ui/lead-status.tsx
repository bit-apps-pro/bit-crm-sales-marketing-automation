import { type FieldItem } from '@features/field-settings/shared/field-types'
import { Tag } from 'antd'
import { useMemo } from 'react'

interface LeadStatusPropsType {
  fields: FieldItem[]
  status: string
}

export default function LeadStatus({ fields, status }: LeadStatusPropsType) {
  const leadStatusLabel = useMemo(() => {
    if (!status || !fields?.length) return ''

    const statusField = fields.find(field => field.field_key === 'lead_status')
    return statusField?.options?.find(option => option.value === status)?.label
  }, [fields, status])

  if (!leadStatusLabel) return

  return (
    <Tag className="m-0 rounded-full" color="default">
      {leadStatusLabel}
    </Tag>
  )
}
