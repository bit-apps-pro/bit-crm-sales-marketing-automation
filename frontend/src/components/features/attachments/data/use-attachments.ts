import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type AttachmentsIndexType } from '../shared/attachment-types'

export default function useAttachments(
  module: string,
  entityId: number,
  page: number | string,
  perPage: number | string,
  search: string
) {
  const { data, error, isError, isPending, isRefetching } = useQuery<
    Response<AttachmentsIndexType>,
    Error,
    AttachmentsIndexType
  >({
    queryFn: ({ signal }) =>
      queryRequest(
        'attachments/index',
        {},
        {
          entityId,
          module,
          page: Number(page),
          perPage: Number(perPage),
          search
        },
        'GET',
        {
          signal
        }
      ),
    queryKey: [
      'attachments',
      'index',
      { entityId, module, page: Number(page), perPage: Number(perPage), search }
    ],
    select: res => res.data,
    staleTime: 5000
  })

  if (isError) {
    console.error(error)
  }

  return {
    attachments: data?.data || [],
    currentPage: data?.current_page || 1,
    isFetchingAttachments: isPending,
    isRefetchingAttachments: isRefetching,
    pageSize: data?.per_page || 0,
    total: data?.total || 0
  }
}
