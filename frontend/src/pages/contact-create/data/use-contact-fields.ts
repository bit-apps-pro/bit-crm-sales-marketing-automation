import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type ContactFieldsResponseType } from '../shared/contact-create-types'

export default function useContactFields() {
  const { data, isFetching, isLoading, isSuccess, refetch } = useQuery<
    Response<ContactFieldsResponseType>,
    Error,
    ContactFieldsResponseType & { columnSettings?: { column_size: number } }
  >({
    queryFn: ({ signal }) => queryRequest('contacts/fields', {}, undefined, 'GET', { signal }),
    queryKey: ['contacts', 'fields'],
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
