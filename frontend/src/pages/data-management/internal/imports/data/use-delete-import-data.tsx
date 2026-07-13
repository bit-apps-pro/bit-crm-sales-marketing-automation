import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

export default function useDeleteImportData() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation<Response<string>, Response<string>, number>({
    mutationFn: (id: number) => queryRequest('import-export-list/delete', { id }),
    mutationKey: ['import-export-list', 'delete'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      messageApi?.success(data.data)
      queryClient.invalidateQueries({ queryKey: ['import-export-list', 'index', 'import'] })
    }
  })

  return {
    deleteImportData: mutateAsync
  }
}
