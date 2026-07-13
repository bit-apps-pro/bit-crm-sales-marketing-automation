import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

export default function useImportDeals(form: FormInstance, handleModal: (open: boolean) => void) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<FormData>,
    Response<string> | Response<ValidationType<FormData>>,
    FormData
  >({
    mutationFn: formData => queryRequest('deals/import', formData),
    mutationKey: ['deals', 'import'],
    onError: error => {
      if (typeof error.data === 'object') {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
        return
      }
      messageApi?.error(error.message || error.data)
    },
    onSuccess: () => {
      messageApi?.success(__('Deals imported successfully'))
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      handleModal(false)
    }
  })

  return {
    importDeals: mutateAsync,
    isImportingDeals: isPending
  }
}
