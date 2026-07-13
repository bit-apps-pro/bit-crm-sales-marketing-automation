/* eslint-disable no-param-reassign */
import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

import {
  type LeadTableSettingsResponseType,
  type UpdateLeadTableSettingsPayloadType
} from '../shared/leads-types'

export default function useUpdateLeadTableSettings() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation<
    Response<UpdateLeadTableSettingsPayloadType>,
    Response<string> | Response<ValidationType<UpdateLeadTableSettingsPayloadType>>,
    UpdateLeadTableSettingsPayloadType,
    { previousItems: LeadTableSettingsResponseType | undefined }
  >({
    mutationFn: (settingsData: UpdateLeadTableSettingsPayloadType) =>
      queryRequest('settings/upsert', settingsData),
    mutationKey: ['update_table'],
    onError: (error, _, context) => {
      queryClient.setQueryData(['lead', 'table-fields'], context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({ queryKey: ['lead', 'table-fields'] })
      const previousItems = queryClient.getQueryData<LeadTableSettingsResponseType>([
        'lead',
        'table-fields'
      ])
      queryClient.setQueryData(['lead', 'table-fields'], (oldItems: LeadTableSettingsResponseType) => {
        if (updatedItems.setting_key === 'lead_table_visible_columns') {
          return create(oldItems, oldItemsDraft => {
            oldItemsDraft.data.visible_columns = updatedItems.setting_value
          })
        }

        if (updatedItems.setting_key === 'lead_table_columns_order') {
          return create(oldItems, oldItemsDraft => {
            oldItemsDraft.data.orders = updatedItems.setting_value
          })
        }

        return oldItems
      })

      return { previousItems }
    }
  })

  return {
    updateLeadTableSettings: mutateAsync
  }
}
