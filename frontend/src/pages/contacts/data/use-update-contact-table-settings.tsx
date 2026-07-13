/* eslint-disable no-param-reassign */
import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

import {
  type UpdateContactTableSettingsPayloadType,
  type UpdateContactTableSettingsResponseType
} from '../shared/types'

export default function useUpdateContactTableSettings() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation<
    Response<UpdateContactTableSettingsPayloadType>,
    Response<string> | Response<ValidationType<UpdateContactTableSettingsPayloadType>>,
    UpdateContactTableSettingsPayloadType,
    { previousItems: undefined | UpdateContactTableSettingsResponseType }
  >({
    mutationFn: (payload: UpdateContactTableSettingsPayloadType) =>
      queryRequest('settings/upsert', payload),
    mutationKey: ['update_table'],
    onError: (error, _, context) => {
      queryClient.setQueryData(['contact', 'table-fields'], context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({ queryKey: ['contact', 'table-fields'] })
      const previousItems = queryClient.getQueryData<UpdateContactTableSettingsResponseType>([
        'contact',
        'table-fields'
      ])
      queryClient.setQueryData(
        ['contact', 'table-fields'],
        (oldItems: UpdateContactTableSettingsResponseType) => {
          if (updatedItems.setting_key === 'contact_table_visible_columns') {
            return create(oldItems, oldItemsDraft => {
              oldItemsDraft.data.visible_columns = updatedItems.setting_value
            })
          }

          if (updatedItems.setting_key === 'contact_table_columns_order') {
            return create(oldItems, oldItemsDraft => {
              oldItemsDraft.data.orders = updatedItems.setting_value
            })
          }
        }
      )

      return { previousItems }
    }
  })

  return {
    updateContactTableSettings: mutateAsync
  }
}
