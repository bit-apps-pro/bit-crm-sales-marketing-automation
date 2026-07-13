import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

export default function useImportCompanies(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<Response<string>, Response<string>, FormData>({
    mutationFn: payload => queryRequest('companies/import', payload),
    mutationKey: ['companies', 'import'],
    onError: error => {
      messageApi?.error(error.message || error.data)
    },
    onSuccess: data => {
      form.resetFields()
      messageApi?.success(data.data)
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    }
  })

  return {
    importCompanies: mutateAsync,
    isImportingCompanies: isPending
  }
}
