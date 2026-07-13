import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type LinkType } from '../shared/link-types'

export default function useSaveLink(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { data, error, isError, isPending, mutateAsync } = useMutation<
    Response<LinkType>,
    Response<string> | Response<ValidationType<LinkType>>,
    LinkType
  >({
    mutationFn: (data: LinkType) => queryRequest<LinkType>('links/store', data),
    mutationKey: ['links', 'store'],
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
      messageApi?.success(__('Link created successfully'))
      queryClient.invalidateQueries({ queryKey: ['links'] })
      queryClient.invalidateQueries({
        queryKey: ['entity-related-lists-count']
      })
    }
  })

  if (isError) {
    console.error(error)
  }

  return {
    isStoringLink: isPending,
    link: data,
    linkStore: mutateAsync
  }
}
