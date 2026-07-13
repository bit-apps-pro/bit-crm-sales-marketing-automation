import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'

export interface TagType {
  id?: number
  slug: string
  title: string
}

export default function useStoreTag() {
  const { isPending, mutateAsync } = useMutation<Response<TagType>, Error, TagType>({
    mutationFn: (tagData: TagType) => queryRequest('tags/store', tagData),
    mutationKey: ['store_tag']
  })

  return {
    isStoringTag: isPending,
    storeTag: mutateAsync
  }
}
