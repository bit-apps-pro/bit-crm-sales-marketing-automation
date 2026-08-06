import { MODULES } from '@common/constants/modules'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

export interface CompanyTagType {
  id: number
  slug: string
  title: string
}

interface TagResType {
  data: CompanyTagType[]
}

export default function useCompanyModuleTags() {
  const { data, isFetching, isLoading, refetch } = useQuery<TagResType>({
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      queryRequest('tags-by-module', undefined, { module: MODULES.COMPANY }, 'GET', { signal }),
    queryKey: ['company_tags', MODULES.COMPANY]
  })

  return {
    companyModuleTags: data?.data || [],
    isTagsFetching: isFetching,
    isTagsLoading: isLoading,
    refetchTags: refetch
  }
}
