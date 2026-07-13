import queryRequest from '@common/helpers/request'
import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface ResponseType {
  fields: FieldItem[]
  orders: Order[]
}

export default function useLeadFields() {
  const { data, isFetching } = useQuery({
    queryFn: ({ signal }) =>
      queryRequest<ResponseType>('leads/fields', {}, undefined, 'GET', { signal }),
    queryKey: ['lead', 'fields'],
    select: processedFields
  })

  return {
    isLeadFieldsFetching: isFetching,
    leadFields: data?.fields || []
  }
}

function processedFields(res: { data: ResponseType }) {
  const allField: FieldItem[] = res?.data?.fields?.filter(isNotSection)?.flatMap(flatGroup) || []

  const fields = allField?.filter(
    field => !['company_name', 'last_name', 'owner_id'].includes(field.field_key)
  )

  return { fields }
}

function isNotSection(field: FieldItem): boolean {
  return field.type !== 'section'
}

function flatGroup(field: FieldItem): FieldItem | FieldItem[] {
  return field.group_fields ? Object.values(field.group_fields) : field
}
