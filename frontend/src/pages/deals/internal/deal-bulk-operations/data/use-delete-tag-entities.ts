import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import {
  useSelectedKeysActionsStore,
  useSelectedKeysStore
} from '@pages/deals/state/use-selected-deal-keys-store'
import { useMutation } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

import { useBulkOperationActionsStore } from '../state/use-bulk-operations-store'

interface TagEntityData {
  deal_ids: number[]
  tag_ids: number[]
}

export default function useDeleteTagEntities(form: FormInstance) {
  const { clearSelectedKeys } = useSelectedKeysActionsStore()
  const { setDetachTagsModalOpen } = useBulkOperationActionsStore()
  const selectedKeys = useSelectedKeysStore()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<TagEntityData>,
    Response<ValidationType<TagEntityData>>,
    number[]
  >({
    mutationFn: tagsIds =>
      queryRequest('deals/detach-tags', {
        deal_ids: selectedKeys,
        tag_ids: tagsIds
      }),
    mutationKey: ['deals', 'detach-tags'],
    onError: e => {
      const error = e.data
      if (typeof error === 'object') {
        const errors = Object.entries(error).map(([, messages]) => ({
          errors: messages,
          name: 'tags'
        }))

        form.setFields(errors)
      } else {
        messageApi?.error(error)
      }
    },
    onSuccess: () => {
      clearSelectedKeys()
      form.resetFields()
      messageApi?.success(__('Tags removed successfully'))
      setDetachTagsModalOpen(false)
    }
  })

  return {
    deleteTagEntity: mutateAsync,
    isTagEntityDeleting: isPending
  }
}
