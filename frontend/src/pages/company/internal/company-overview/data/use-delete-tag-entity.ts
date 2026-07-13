import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'

interface DeleteData {
  company_id?: string
  tag_id?: number
}

export default function useDeleteTagEntity() {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (deleteData: DeleteData) => queryRequest('companies/detach-tag', deleteData),
    mutationKey: ['companies', 'detach-tag']
  })

  return {
    deleteTagEntity: mutateAsync,
    isTagEntityDeleting: isPending
  }
}
