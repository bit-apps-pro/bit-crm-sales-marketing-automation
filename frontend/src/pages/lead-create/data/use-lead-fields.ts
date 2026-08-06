import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface ResponseType {
  column_settings?: { column_size: number }
  fields: FieldItem[]
  orders: Order[]
}

export default function useLeadFields() {
  const { data, isFetching, isLoading, isSuccess, refetch } = useQuery<
    Response<ResponseType>,
    Error,
    ResponseType & { columnSettings?: { column_size: number } }
  >({
    queryFn: ({ signal }) =>
      queryRequest<ResponseType>('leads/fields', {}, undefined, 'GET', { signal }),
    queryKey: ['leads', 'fields'],
    select: res => {
      const fields = res?.data?.fields
      const orders = res?.data?.orders
      const columnSettings = res?.data?.column_settings

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
  })

  return {
    columnSettings: data?.columnSettings || false,
    fields: data?.fields || [],
    isFetchSuccess: isSuccess,
    isFieldsFetching: isFetching,
    isFieldsLoading: isLoading,
    orders: data?.orders || [],
    refetchFields: refetch,
    totalFetchedFields: data?.fields?.length || 0
  }
}
