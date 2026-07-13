import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { type TagItemType } from '../shared/tag-types'

export default function useUpdateTag(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)

  const { error, isError, isPending, mutateAsync } = useMutation<
    Response<TagItemType>,
    Response<string> | Response<ValidationType<TagItemType>>,
    TagItemType
  >({
    mutationFn: tagData => queryRequest('tags/update', tagData),
    mutationKey: ['tags', 'update'],
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
    isUpdatingTag: isPending,
    updateTag: mutateAsync
  }
}
