import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type LinkType } from '../shared/link-types'
import useLinkStore from '../state/use-link-store'

export default function useLink(id: null | number) {
  const { isEditModalOpen } = useLinkStore()

  const { data, error, isError, isLoading } = useQuery<Response<LinkType>, Error, LinkType>({
    enabled: isEditModalOpen,
    queryFn: ({ signal }) => queryRequest(`links/edit/${id}`, {}, undefined, 'GET', { signal }),
    queryKey: ['links', 'edit', id],
    select: res => res.data
  })

  if (isError) {
    console.error(error)
  }

  return {
    isLoadingLink: isLoading,
    link: data
  }
}
