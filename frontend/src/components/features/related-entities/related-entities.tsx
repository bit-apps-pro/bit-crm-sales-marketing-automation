import PAGINATION from '@common/constants/pagination'
import { checkCapability, getCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useDebounceState from '@common/hooks/useDebounceState'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import { Button, Typography } from 'antd'
import { useEffect, useMemo } from 'react'
import { LuPlus, LuX } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import useRelatedEntities from './data/use-related-entities'
import useRelatedEntityFields from './data/use-related-entity-fields'
import { useRelatedEntityBulkOperationsStoreActions } from './state/use-related-entity-bulk-operations-store'
import {
  useRelatedEntityTableFieldList,
  useRelatedEntityTableFieldsStoreActions
} from './state/use-related-entity-table-field-list-store'
import {
  useRelatedEntityKeysStoreActions,
  useSelectedKeys
} from './state/use-selected-related-entity-keys-store'
import DetachRelatedEntityModal from './ui/detach-related-entity-modal'
import RelatedEntitiesTable from './ui/related-entities-table'
import RelatedEntitiesTableColumnSettings from './ui/related-entities-table-column-settings'

interface RelatedEntitiesProps {
  detachable: boolean
  entity: string
  entityId: number
  relatedEntity: string
}
export default function RelatedEntities({
  detachable,
  entity,
  entityId,
  relatedEntity
}: RelatedEntitiesProps) {
  const fieldList = useRelatedEntityTableFieldList()
  const { setFieldList } = useRelatedEntityTableFieldsStoreActions()
  const [searchParams] = useSearchParams()
  const { setDetachModalOpen } = useRelatedEntityBulkOperationsStoreActions()
  const selectedKeys = useSelectedKeys()
  const { clearSelectedKeys } = useRelatedEntityKeysStoreActions()
  const page = Number(searchParams.get('page')) || 1
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''

  const { fields, isFieldsPending, orders, visibleColumns } = useRelatedEntityFields(
    entity,
    relatedEntity
  )

  const queryParams = useMemo(
    () => ({
      entity,
      page,
      perPage,
      relatedEntity,
      sortBy,
      sortOrder
    }),
    [perPage, page, relatedEntity, sortBy, sortOrder, entity]
  )

  const debouncedQueryParams = useDebounceState<typeof queryParams>(queryParams, 300)

  const { entities, isEntitiesPending, totalEntities } = useRelatedEntities(debouncedQueryParams)

  useEffect(() => {
    if (fields.length !== 0) {
      setFieldList(fields)
    }
  }, [fields, setFieldList])

  useEffect(() => {
    return () => {
      clearSelectedKeys()
      setDetachModalOpen(false)
    }
  }, [entityId, entity, relatedEntity, clearSelectedKeys, setDetachModalOpen])

  return (
    <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0 capitalize" level={5}>
            {__(relatedEntity)}
          </Typography.Title>
          <Link target="_blank" to={`../${relatedEntity}s/create?${entity}Id=${entityId}`}>
            <Button className="rounded-full text-sm capitalize" icon={<LuPlus />} type="primary">
              {__('New')}
            </Button>
          </Link>
          <RelatedEntitiesTableColumnSettings
            entity={entity}
            orders={orders}
            relatedEntity={relatedEntity}
            visibleColumns={visibleColumns}
          />
        </div>
        <If
          conditions={
            selectedKeys.length !== 0 &&
            checkCapability(getCapability('UPDATE', relatedEntity)) &&
            detachable
          }
        >
          <Button
            className="rounded-full text-sm capitalize"
            danger
            icon={<LuX className="text-red-600" />}
            onClick={() => setDetachModalOpen(true)}
          >
            {selectedKeys.length === 1
              ? __(`Detach ${relatedEntity} (1)`, 'bit-crm')
              : __(`Detach ${relatedEntity}s (${selectedKeys.length})`, 'bit-crm')}
          </Button>
        </If>
      </div>

      <RelatedEntitiesTable
        detachable={detachable}
        entities={entities}
        entity={entity}
        entityId={entityId}
        fields={fieldList}
        isLoading={isEntitiesPending || isFieldsPending}
        relatedEntity={relatedEntity}
      />
      <div className="flex justify-center py-3">
        <Pagination total={totalEntities} />
      </div>
      <If conditions={detachable}>
        <DetachRelatedEntityModal entity={entity} entityId={entityId} relatedEntity={relatedEntity} />
      </If>
    </div>
  )
}
