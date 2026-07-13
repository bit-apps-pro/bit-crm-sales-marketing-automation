import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type LinkType } from '../shared/link-types'

export default function useUpdateLink(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<LinkType>,
    Response<string> | Response<ValidationType<LinkType>>,
    LinkType
  >({
    mutationFn: data => queryRequest<LinkType>('links/update', data),
    mutationKey: ['links', 'update'],
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
      messageApi?.success(__('Link updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['links'] })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isUpdatingLink: isPending,
    updateLink: mutateAsync
  }
}
