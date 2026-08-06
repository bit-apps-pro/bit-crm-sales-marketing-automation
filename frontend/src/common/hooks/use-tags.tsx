import queryRequest from '@common/helpers/request'
import { type TagItemType } from '@pages/tags/shared/tag-types'
import { useQuery } from '@tanstack/react-query'

interface TagResType {
  data: TagItemType[]
}

export default function useTags({ isEnabled = true, module }: { isEnabled?: boolean; module: string }) {
  const { data, isFetching, isLoading, refetch } = useQuery<TagResType>({
    enabled: isEnabled,
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      queryRequest('tags-by-module', undefined, { module }, 'GET', { signal }),
    queryKey: ['tags', module]
  })

  return {
    isTagsFetching: isFetching,
    isTagsLoading: isLoading,
    refetchTags: refetch,
    tags: data?.data || []
  }
}
