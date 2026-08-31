import { filterHiddenFields } from '@common/helpers/filter-hidden-fields'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'
import { type Stage } from '@pages/deal-settings/ui/stages/shared/types'
import { useDealsKanbanActionsStore } from '@pages/deals/internal/deals-kanban/state/use-deals-kanban-store'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

interface DealFieldsResponse {
  fields: FieldItem[]
  orders: Order[]
  stages: Stage[]
  visible_columns: string[]
}

export default function useDealFields() {
  const { setStages } = useDealsKanbanActionsStore()
  const { data, isFetching, isLoading, isSuccess, refetch } = useQuery<
    Response<DealFieldsResponse>,
    Error,
    DealFieldsResponse
  >({
    queryFn: ({ signal }) => queryRequest('deals/table-fields', {}, undefined, 'GET', { signal }),
    queryKey: ['deals', 'table-fields'],
    select: processedFields,
    staleTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (data?.stages?.length) setStages(data.stages)
  }, [data?.stages, setStages])

  return {
    fields: data?.fields || [],
    isFetchSuccess: isSuccess,
    isFieldsFetching: isFetching,
    isFieldsLoading: isLoading,
    orders: data?.orders || [],
    refetchFields: refetch,
    stages: data?.stages || [],
    totalFetchedFields: data?.fields?.length || 0,
    visibleColumns: data?.visible_columns || []
  }
}

function processedFields(res: { data: DealFieldsResponse }) {
  const fields: FieldItem[] = filterHiddenFields(
    res?.data?.fields?.filter(isNotSection)?.flatMap(flatGroup)
  )
  const orders = res?.data?.orders
  const visibleColumns = res?.data?.visible_columns || ['name', 'amount', 'probability', 'stage']
  const stages = res?.data?.stages || []

  const mergedFields = addVisibilityFlag(fields, visibleColumns)

  if (!orders?.length) {
    return { fields: mergedFields, orders: [], stages, visible_columns: visibleColumns }
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
    stages,
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
