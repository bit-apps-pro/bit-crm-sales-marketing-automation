import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

interface EntityRelatedListsCountResponse {
  attachments: string
  calls: string
  links: string
  meetings: string
  notes: string
  tasks: string
}

interface EntityRelatedListsCountParams {
  entityId: number
  module: string
}

export default function useEntityRelatedListsCount({ entityId, module }: EntityRelatedListsCountParams) {
  const { data } = useQuery<
    Response<EntityRelatedListsCountResponse>,
    Error,
    EntityRelatedListsCountResponse
  >({
    enabled: entityId > 0 && Boolean(module),
    queryFn: ({ signal }) =>
      queryRequest('common/entity-related-lists-count', {}, { entityId, module }, 'GET', { signal }),
    queryKey: ['entity-related-lists-count', module, entityId],
    select: res => res.data
  })

  return {
    attachmentCount: data?.attachments ?? '',
    callCount: data?.calls ?? '',
    linkCount: data?.links ?? '',
    meetingCount: data?.meetings ?? '',
    noteCount: data?.notes ?? '',
    taskCount: data?.tasks ?? ''
  }
}
