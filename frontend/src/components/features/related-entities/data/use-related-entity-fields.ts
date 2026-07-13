import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FieldItem, type Order } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'

interface ResponseType {
  fields: FieldItem[]
  orders: false | Order[]
  visible_columns: string[]
}

interface ProcessedFieldsResult {
  fields: FieldItem[]
  orders: Order[]
  visibleColumns: string[]
}

export default function useRelatedEntityFields(entity: string, relatedEntity: string) {
  const { data, isFetching, isPending, isSuccess, refetch } = useQuery<
    Response<ResponseType>,
    Error,
    ProcessedFieldsResult
  >({
    queryFn: ({ signal }) =>
      queryRequest(
        'common/related-entities/table-fields',
        {},
        {
          entity,
          relatedEntity
        },
        'GET',
        {
          signal
        }
      ),
    queryKey: ['common', 'related-entities', 'table-fields', relatedEntity, entity],
    select: response => processedFields(response.data, relatedEntity)
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

const CONTACT_FULL_NAME_FIELD: FieldItem = {
  field_key: 'full_name',
  id: -1,
  label: __('Full Name'),
  name: 'full_name',
  required: false,
  status: true,
  type: 'text'
}

function processedFields(res: ResponseType, relatedEntity: string): ProcessedFieldsResult {
  const fields: FieldItem[] = res?.fields?.filter(isNotSection)?.flatMap(flatGroup) || []
  const orders = res?.orders

  const defaultVisibleColumns =
    relatedEntity === MODULES.DEAL
      ? ['name', 'email', 'contact_id']
      : relatedEntity === MODULES.CONTACT
        ? ['full_name', 'email', 'phone']
        : ['last_name', 'email', 'phone']

  const savedColumns = res?.visible_columns?.length ? res.visible_columns : defaultVisibleColumns

  // pinned columns must always be visible regardless of saved settings
  const pinnedKey = relatedEntity === MODULES.CONTACT ? 'full_name' : 'name'
  const visibleColumns = savedColumns.includes(pinnedKey) ? savedColumns : [pinnedKey, ...savedColumns]

  const allFields =
    relatedEntity === MODULES.CONTACT
      ? [CONTACT_FULL_NAME_FIELD, ...fields.filter(f => f.field_key !== 'full_name')]
      : fields

  const mergedFields = addVisibilityFlag(allFields, visibleColumns)

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return { fields: mergedFields, orders: [], visibleColumns }
  }

  const fieldsNotInOrders = mergedFields.filter(
    field => !orders.some((order: Order) => order.field_key === field.field_key)
  )

  const sortedOrder = orders.toSorted((a: Order, b: Order) => a.order - b.order)
  const sortedFields = sortedOrder
    .map((order: Order) => mergedFields.find(field => field.field_key === order.field_key))
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
