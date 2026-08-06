import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useIsEditModalOpen } from '@pages/tags/state/use-tag-store'
import { useQuery } from '@tanstack/react-query'

import { type TagItemType } from '../shared/tag-types'

export default function useTag(id: number) {
  const isEditModalOpen = useIsEditModalOpen()

  const { data, error, isError, isLoading } = useQuery<Response<TagItemType>, Error, TagItemType>({
    enabled: isEditModalOpen && id > 0,
    queryFn: () => queryRequest(`tags/edit/${id}`, {}, undefined, 'GET'),
    queryKey: ['tag', id],
    select: res => res.data
  })

  if (isError) {
    console.error(error)
  }

  return {
    isTagLoading: isLoading,
    tag: data
  }
}
