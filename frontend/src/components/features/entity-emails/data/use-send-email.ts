import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

export interface SendEmailPayload {
  attachments?: Attachment[]
  entity_email: string
  entity_id: number
  message: string
  module: string
  subject: string
}

export default function useSendEmail(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { data, error, isError, isPending, mutateAsync } = useMutation<
    Response<SendEmailPayload>,
    Response<string> | Response<ValidationType<SendEmailPayload>>,
    SendEmailPayload
  >({
    mutationFn: (data: SendEmailPayload) => queryRequest<SendEmailPayload>('emails/send', data),
    mutationKey: ['emails', 'send'],
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
      messageApi?.success(__('Email sent successfully'))
      queryClient.invalidateQueries({ queryKey: ['emails'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    email: data,
    isSendingEmail: isPending,
    sendEmail: mutateAsync
  }
}
