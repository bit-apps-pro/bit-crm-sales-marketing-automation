import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import {
  useCompanyKeysStoreActions,
  useSelectedKeys
} from '@pages/companies/state/use-selected-company-keys-store'
import { useMutation } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useContext } from 'react'

interface TagEntityData {
  company_ids: number[]
  tag_ids: number[]
}

export default function useSaveTagEntities(form: FormInstance) {
  const selectedKeys = useSelectedKeys()
  const { clearSelectedKeys } = useCompanyKeysStoreActions()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<TagEntityData>,
    Response<string> | Response<ValidationType<TagEntityData>>,
    number[]
  >({
    mutationFn: tagsIds =>
      queryRequest('companies/attach-tags', {
        company_ids: selectedKeys,
        tag_ids: tagsIds
      }),
    mutationKey: ['companies', 'attach-tags'],
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
      messageApi?.success(__('Tags added successfully'))
      clearSelectedKeys()
    }
  })

  return {
    isTagEntityStoring: isPending,
    storeTagEntity: mutateAsync
  }
}
