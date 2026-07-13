import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface DealFieldsResponse {
  fields: FieldItem[]
}

interface ProcessedFields extends DealFieldsResponse {
  customFields: FieldItem[]
  systemDefinedFields: FieldItem[]
}

export default function useDealFields() {
  const { data, isFetching } = useQuery<Response<DealFieldsResponse>, Error, ProcessedFields>({
    queryFn: ({ signal }) => queryRequest('deals/fields', {}, undefined, 'GET', { signal }),
    queryKey: ['lead-conversion', 'deal-fields'],
    select: processedFields
  })

  return {
    dealCustomFields: data?.customFields || [],
    dealFields: data?.fields || [],
    dealSystemDefinedFields: data?.systemDefinedFields || [],
    isDealFieldsFetching: isFetching
  }
}

function processedFields(res: { data: DealFieldsResponse }) {
  const allFields: FieldItem[] = res?.data?.fields?.filter(isNotSection)?.flatMap(flatGroup) || []

  const fields = allFields?.filter(
    field =>
      !['name', 'probability', 'stage'].includes(field.field_key) &&
      !['lookup_autocomplete', 'lookup_select'].includes(field.type)
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
