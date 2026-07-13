import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type ImapType } from '../shared/imap-type'

export default function useUpdateImap(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<ImapType>,
    Response<string> | Response<ValidationType<ImapType>>,
    ImapType
  >({
    mutationFn: imapData => queryRequest<ImapType>('imaps/update', imapData),
    mutationKey: ['update', 'imap'],
    onError: error => {
      if (typeof error.data === 'object') {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
        return
      }

      messageApi?.error(error.data)
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingImap: isPending,
    updateImap: mutateAsync
  }
}
