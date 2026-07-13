import queryRequest from '@common/helpers/request'
import { type DeleteTagEntityPayloadType } from '@pages/contact/shared/contact-types'
import { useMutation } from '@tanstack/react-query'

export default function useDeleteTagEntity() {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (payload: DeleteTagEntityPayloadType) => queryRequest('contacts/detach-tag', payload),
    mutationKey: ['remove_tag']
  })

  return {
    deleteTagEntity: mutateAsync,
    isTagEntityDeleting: isPending
  }
}
