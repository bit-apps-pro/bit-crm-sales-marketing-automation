import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'

import { type TagItemType } from '../shared/tag-types'

export default function useStoreTag() {
  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<TagItemType>,
    Error,
    TagItemType
  >({
    mutationFn: (tagData: TagItemType) => queryRequest('tags/store', tagData),
    mutationKey: ['store_tag']
  })

  if (isError) {
    console.error(error)
  }

  return {
    isStoringTag: isPending,
    storeTag: mutateAsync
  }
}
