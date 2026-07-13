import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type TagItemType } from '@pages/tags/shared/tag-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

interface DeleteTagEntityPayloadType {
  lead_ids: number[]
  tag_ids: number[]
}

export default function useDeleteTagEntity(form: FormInstance) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<TagItemType>,
    Response<string> | Response<ValidationType<TagItemType>>,
    DeleteTagEntityPayloadType
  >({
    mutationFn: (payload: DeleteTagEntityPayloadType) =>
      queryRequest('leads/detach-tags', payload, undefined, 'POST'),
    mutationKey: ['delete_lead_tag_entity'],
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
      form.resetFields()
      messageApi?.success(__('Tag removed successfully'))
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })

  return {
    deleteTagEntity: mutateAsync,
    isTagEntityDeleting: isPending
  }
}
