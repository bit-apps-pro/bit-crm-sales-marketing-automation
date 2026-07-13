import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'

interface DeleteData {
  lead_id?: string
  tag_id?: number
}

export default function useDeleteTagEntity() {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (deleteData: DeleteData) => queryRequest('leads/detach-tag', deleteData),
    mutationKey: ['remove_tag']
  })

  return {
    deleteTagEntity: mutateAsync,
    isTagEntityDeleting: isPending
  }
}
