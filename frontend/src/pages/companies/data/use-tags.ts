import { MODULES } from '@common/constants/modules'
import queryRequest from '@common/helpers/request'
import { type TagItemType } from '@pages/tags/shared/tag-types'
import { useQuery } from '@tanstack/react-query'

interface TagResType {
  data: TagItemType[]
}

export default function useTags(isEnabled: boolean) {
  const { data, isFetching, isLoading, refetch } = useQuery<TagResType>({
    enabled: isEnabled,
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      queryRequest('tags-by-module', undefined, { module: MODULES.COMPANY }, 'GET', { signal }),
    queryKey: ['tags-by-module', MODULES.COMPANY]
  })

  return {
    isTagsFetching: isFetching,
    isTagsLoading: isLoading,
    refetchTag: refetch,
    tags: data?.data || []
  }
}
