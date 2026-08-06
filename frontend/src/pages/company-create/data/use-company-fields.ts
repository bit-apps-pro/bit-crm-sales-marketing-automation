import queryRequest from '@common/helpers/request'
import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface ResponseType {
  column_settings?: { column_size: number }
  fields: FieldItem[]
  orders: Order[]
}

export default function useCompanyFields() {
  const { data, isFetching, isLoading, isSuccess, refetch } = useQuery({
    queryFn: ({ signal }) =>
      queryRequest<ResponseType>('companies/fields', {}, undefined, 'GET', { signal }),
    queryKey: ['companies', 'fields'],
    select: processFields
  })

  return {
    columnSettings: data?.columnSettings || false,
    fields: data?.fields || [],
    isFetchSuccess: isSuccess,
    isFieldsFetching: isFetching,
    isFieldsLoading: isLoading,
    orders: data?.orders || [],
    refetchFields: refetch
  }
}

function processFields(res: { data: ResponseType }) {
  const fields = res?.data?.fields
  const orders = res?.data?.orders
  const columnSettings = res?.data?.column_settings || false

  if (!orders?.length) {
    return { columnSettings, fields: fields, orders: [] }
  }

  const fieldsNotInOrders = fields.filter(
    field => !orders.some(order => order.field_key === field.field_key)
  )

  const sortedOrder = orders.toSorted((a, b) => a.order - b.order)
  const sortedFields = sortedOrder
    .map(order => fields.find(field => field.field_key === order.field_key))
    .filter(Boolean)

  return {
    columnSettings,
    fields: [...sortedFields, ...fieldsNotInOrders],
    orders: sortedOrder
  }
}
