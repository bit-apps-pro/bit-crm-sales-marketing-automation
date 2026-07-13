import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type NotesIndexType } from '../shared/note-types'

export default function useNotes(
  module: string,
  entityId: number,
  page: number | string,
  perPage: number | string,
  sortOrder: string,
  search: string
) {
  const { data, error, isError, isPending, isRefetching, refetch } = useQuery<
    Response<NotesIndexType>,
    Error,
    NotesIndexType
  >({
    queryFn: ({ signal }) =>
      queryRequest<NotesIndexType>(
        'notes/index',
        {},
        {
          entityId,
          module,
          page: Number(page),
          perPage: Number(perPage),
          search,
          sortOrder
        },
        'GET',
        {
          signal
        }
      ),
    queryKey: [
      'notes',
      'index',
      { entityId, module, page: Number(page), perPage: Number(perPage), search, sortOrder }
    ],
    select: res => res.data,
    staleTime: 5000
  })

  if (isError) {
    console.error(error)
  }

  return {
    currentPage: data?.current_page || 1,
    isFetchingNotes: isPending,
    isRefetchingNotes: isRefetching,
    notes: data?.data,
    pageSize: data?.per_page || 0,
    refetchNotes: refetch,
    total: data?.total || 0
  }
}
