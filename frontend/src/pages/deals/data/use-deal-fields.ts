import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface DealFieldsResponse {
  fields: FieldItem[]
  orders: Order[]
  visible_columns: string[]
}

export default function useDealFields() {
  const { data, isFetching, isLoading, isSuccess, refetch } = useQuery<
    Response<DealFieldsResponse>,
    Error,
    DealFieldsResponse
  >({
    queryFn: ({ signal }) => queryRequest('deals/table-fields', {}, undefined, 'GET', { signal }),
    queryKey: ['deals', 'table-fields'],
    select: processedFields
  })

  return {
    fields: data?.fields || [],
    isFetchSuccess: isSuccess,
    isFieldsFetching: isFetching,
    isFieldsLoading: isLoading,
    orders: data?.orders || [],
    refetchFields: refetch,
    totalFetchedFields: data?.fields?.length || 0,
    visibleColumns: data?.visible_columns || []
  }
}

function processedFields(res: { data: DealFieldsResponse }) {
  const fields: FieldItem[] = res?.data?.fields?.filter(isNotSection)?.flatMap(flatGroup) || []
  const orders = res?.data?.orders
  const visibleColumns = res?.data?.visible_columns || ['name', 'amount', 'probability', 'stage']

  const mergedFields = addVisibilityFlag(fields, visibleColumns)

  if (!orders?.length) {
    return { fields: mergedFields, orders: [], visible_columns: visibleColumns }
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
    visible_columns: visibleColumns
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
