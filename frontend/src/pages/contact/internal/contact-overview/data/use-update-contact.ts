import NotifyContext from '@common/context/NotifyContext'
import { type ProcessedFieldsResult } from '@common/helpers/format-module-fields-values'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { setFormErrors } from '@features/entity-form/shared/entity-form-helpers'
import { type ContactType } from '@pages/contact/shared/contact-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

export default function useUpdateContact(form: FormInstance) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<ProcessedFieldsResult>,
    Response<string> | Response<ValidationType<ContactType>>,
    ProcessedFieldsResult
  >({
    mutationFn: (contactData: ProcessedFieldsResult) =>
      queryRequest(`contacts/${contactData.id}`, contactData),
    mutationKey: ['update_contact'],
    onError: error => {
      if (typeof error.data === 'object') return setFormErrors(form, error.data)

      messageApi?.error(error.message || error.data)
    },
    onSuccess: () => {
      messageApi?.success(__('Contact updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['activity-logs', 'index'] })
    }
  })

  return {
    isUpdatePending: isPending,
    updateContact: mutateAsync
  }
}
