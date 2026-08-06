import { checkCapability, getCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type ModuleType } from '@common/types/types'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

export interface SearchData {
  entity: string
  page: number
  perPage: number
  relatedEntity: string
  sortBy: string
  sortOrder: string
}

export interface EntityResponse {
  current_page: number
  current_total: number
  data: ModuleType[]
  last_page: number
  pages: number
  per_page: number
  total: number
}

export default function useRelatedEntities({
  entity,
  page,
  perPage,
  relatedEntity,
  sortBy,
  sortOrder
}: SearchData) {
  const { id } = useParams<{ id: string }>()
  const { data, isError, isFetching, isLoading, refetch } = useQuery<
    Response<EntityResponse>,
    Error,
    EntityResponse
  >({
    enabled: Boolean(id) && checkCapability(getCapability('VIEW', relatedEntity)),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest(
        `common/related-entities`,
        { entity, entityId: id, page, perPage, relatedEntity, sortBy, sortOrder },
        undefined,
        'POST',
        {
          signal
        }
      ),
    queryKey: [
      'common',
      'related-entities',
      relatedEntity,
      entity,
      id,
      page,
      perPage,
      sortBy,
      sortOrder
    ],
    select: response => response.data
  })

  return {
    currentPage: data?.current_page || 0,
    currentTotal: data?.current_total || 0,
    entities: data?.data || [],
    isEntitiesError: isError,
    isEntitiesFetching: isFetching,
    isEntitiesLoading: isLoading,
    refetchEntities: refetch,
    totalEntities: data?.total || 0
  }
}
