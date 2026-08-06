import queryRequest from '@common/helpers/request'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface ResponseType {
  fields: FieldItem[]
}

export default function useContactFields() {
  const { data, isFetching, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      queryRequest<ResponseType>('contacts/fields', {}, undefined, 'GET', { signal }),
    queryKey: ['contact', 'fields'],
    select: processedFields
  })

  return {
    contactCustomFields: data?.customFields || [],
    contactFields: data?.fields || [],
    contactSystemDefinedFields: data?.systemDefinedFields || [],
    isContactFieldsFetching: isFetching,
    isContactFieldsLoading: isLoading
  }
}

function processedFields(res: { data: ResponseType }) {
  const allFields: FieldItem[] = res?.data?.fields?.filter(isNotSection)?.flatMap(flatGroup) || []

  const fields = allFields?.filter(
    field =>
      field.field_key !== 'last_name' && !['lookup_autocomplete', 'lookup_select'].includes(field.type)
  )

  const customFields = fields?.filter(field => !!field.is_custom === true)
  const systemDefinedFields = fields?.filter(field => !!field.is_custom === false)

  return { customFields, fields, systemDefinedFields }
}

function isNotSection(field: FieldItem): boolean {
  return field.type !== 'section'
}

function flatGroup(field: FieldItem): FieldItem | FieldItem[] {
  return field.group_fields ? Object.values(field.group_fields) : field
}
