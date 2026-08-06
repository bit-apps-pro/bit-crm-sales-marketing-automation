import queryRequest from '@common/helpers/request'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface ResponseType {
  fields: FieldItem[]
}

export default function useCompanyFields() {
  const { data, isFetching, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      queryRequest<ResponseType>('companies/fields', {}, undefined, 'GET', { signal }),
    queryKey: ['company', 'fields'],
    select: processedFields
  })

  return {
    companyCustomFields: data?.customFields || [],
    companyFields: data?.fields || [],
    companySystemDefinedFields: data?.systemDefinedFields || [],
    isCompanyFieldsFetching: isFetching,
    isCompanyFieldsLoading: isLoading
  }
}

function processedFields(res: { data: ResponseType }) {
  const allFields: FieldItem[] = res?.data?.fields?.filter(isNotSection)?.flatMap(flatGroup) || []

  const fields = allFields?.filter(
    field => field.field_key !== 'name' && !['lookup_autocomplete', 'lookup_select'].includes(field.type)
  )

  const customFields = fields?.filter(field => Boolean(field.is_custom) === true)
  const systemDefinedFields = fields?.filter(field => Boolean(field.is_custom) === false)

  return { customFields, fields, systemDefinedFields }
}

function isNotSection(field: FieldItem): boolean {
  return field.type !== 'section'
}

function flatGroup(field: FieldItem): FieldItem | FieldItem[] {
  return field.group_fields ? Object.values(field.group_fields) : field
}
