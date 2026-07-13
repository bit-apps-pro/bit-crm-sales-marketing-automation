import { MODULES } from '@common/constants/modules'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { MODULE_FIELD_CONFIG } from '@features/form-builder/shared/module-field-config'
import { useQuery } from '@tanstack/react-query'

import { type FieldsResponseType } from '../shared/field-types'

export default function useFields(module: string) {
  const { endPoint, queryKeys } = MODULE_FIELD_CONFIG[module]

  const { data, isFetching, isPending, isSuccess, refetch } = useQuery<
    Response<FieldsResponseType>,
    Error,
    FieldsResponseType & { columnSettings?: { column_size: number } }
  >({
    queryFn: ({ signal }) =>
      queryRequest(endPoint, {}, undefined, 'GET', { signal }, module === MODULES.PRODUCT),
    queryKey: queryKeys,
    select: res => {
      const fields = res?.data?.fields
      const orders = res?.data?.orders
      const columnSettings = res?.data?.column_settings

      if (!orders?.length) {
        return { columnSettings, fields, orders: [] }
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
    isFieldsPending: isPending,
    orders: data?.orders || [],
    refetchFields: refetch,
    totalFetchedFields: data?.fields?.length || 0
  }
}
