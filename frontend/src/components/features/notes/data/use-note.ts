import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type NoteType } from '../shared/note-types'

export default function useNote(id: null | number, isEnabled: boolean) {
  const { data, error, isError, isPending } = useQuery<Response<NoteType>, Error, NoteType>({
    enabled: isEnabled,
    queryFn: ({ signal }) => queryRequest(`notes/edit/${id}`, {}, undefined, 'GET', { signal }),
    queryKey: ['notes', 'edit', id],
    select: res => res.data
  })

  if (isError) {
    console.error(error)
  }

  return {
    isFetchingNote: isPending,
    note: data
  }
}
