import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { MODULE_FIELD_CONFIG } from '@features/form-builder/shared/module-field-config'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

import {
  type FieldItem,
  type Order,
  type UpdateFieldsPayloadType,
  type UpdateFieldsResponseType
} from '../shared/field-types'

export default function useUpdateFields(module: string) {
  const { queryKeys, tableQueryKeys } = MODULE_FIELD_CONFIG[module]
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<FieldItem>,
    Response<string> | Response<ValidationType<FieldItem>>,
    UpdateFieldsPayloadType,
    { previousItems: undefined | UpdateFieldsResponseType }
  >({
    mutationFn: settingsData => queryRequest('settings/upsert', settingsData),
    mutationKey: queryKeys,
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKeys, context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({ queryKey: queryKeys })
      const previousItems = queryClient.getQueryData<UpdateFieldsResponseType>(queryKeys)
      queryClient.setQueryData(queryKeys, (oldItems: undefined | UpdateFieldsResponseType) =>
        create(oldItems, oldItemsDraft => {
          if (!oldItemsDraft?.data) return
          // eslint-disable-next-line no-param-reassign
          oldItemsDraft.data.orders = updatedItems.setting_value as Order[]
        })
      )

      return { previousItems }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableQueryKeys })
    }
  })

  return {
    isUpdateFieldsPending: isPending,
    updateFields: mutateAsync
  }
}
