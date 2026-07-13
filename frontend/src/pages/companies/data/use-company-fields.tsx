import queryRequest from '@common/helpers/request'
import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface ResponseType {
  fields: FieldItem[]
  orders: Order[]
  visible_columns: string[]
}

export default function useCompanyFields() {
  const { data, isFetching, isPending, isSuccess, refetch } = useQuery({
    queryFn: ({ signal }) =>
      queryRequest<ResponseType>('companies/table-fields', {}, undefined, 'GET', { signal }),
    queryKey: ['company', 'table-fields'],
    select: processedFields
  })

  return {
    fields: data?.fields || [],
    isFetchSuccess: isSuccess,
    isFieldsFetching: isFetching,
    isFieldsPending: isPending,
    orders: data?.orders || [],
    refetchFields: refetch,
    totalFetchedFields: data?.fields?.length || 0,
    visibleColumns: data?.visibleColumns || []
  }
}

function processedFields(res: { data: ResponseType }) {
  const fields: FieldItem[] = res?.data?.fields?.filter(isNotSection)?.flatMap(flatGroup) || []
  const orders = res?.data?.orders
  const visibleColumns = res?.data?.visible_columns || ['name', 'phone', 'website']

  const mergedFields = addVisibilityFlag(fields, visibleColumns)

  if (!orders?.length) {
    return { fields: mergedFields, orders: [], visibleColumns }
  }

  const fieldsNotInOrders = mergedFields.filter(
    field => !orders.some(order => order.field_key === field.field_key)
  )

  const sortedOrder = orders.toSorted((a, b) => a.order - b.order)
  const sortedFields = sortedOrder
    .map(order => mergedFields.find(field => field.field_key === order.field_key))
    .filter(Boolean)

  return {
    fields: [...sortedFields, ...fieldsNotInOrders],
    orders: sortedOrder,
    visibleColumns
  }
}

function isNotSection(field: FieldItem): boolean {
  return field.type !== 'section'
}

function flatGroup(field: FieldItem): FieldItem | FieldItem[] {
  return field.group_fields ? Object.values(field.group_fields) : field
}

function addVisibilityFlag(fields: FieldItem[], visibleColumns: string[]): FieldItem[] {
  return fields.map(field => ({
    ...field,
    is_visible: visibleColumns.includes(field.field_key)
  }))
}
