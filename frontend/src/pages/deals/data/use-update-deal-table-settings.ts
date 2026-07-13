/* eslint-disable no-param-reassign */
import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { SETTING_KEY } from '@pages/deal-settings/shared/constants'
import {
  type UpdateDealTableSettingsPayload,
  type UpdateDealTableSettingsResponse
} from '@pages/deal/shared/deal-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

export default function useUpdateDealTableSettings() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation<
    Response<UpdateDealTableSettingsPayload>,
    Response<string> | Response<ValidationType<UpdateDealTableSettingsPayload>>,
    UpdateDealTableSettingsPayload,
    { previousItems: undefined | UpdateDealTableSettingsResponse }
  >({
    mutationFn: settingsData => queryRequest('settings/upsert', settingsData),
    mutationKey: ['settings', 'upsert'],
    onError: (error, _, context) => {
      queryClient.setQueryData(['deals', 'table-fields'], context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({ queryKey: ['deals', 'table-fields'] })
      const previousItems = queryClient.getQueryData<UpdateDealTableSettingsResponse>([
        'deals',
        'table-fields'
      ])
      queryClient.setQueryData(
        ['deals', 'table-fields'],
        (oldItems: UpdateDealTableSettingsResponse) => {
          switch (updatedItems.setting_key) {
            case SETTING_KEY.DEAL_TABLE_COLUMNS_ORDER: {
              return create(oldItems, oldItemsDraft => {
                oldItemsDraft.data.orders = updatedItems.setting_value
              })
            }
            case SETTING_KEY.DEAL_TABLE_VISIBLE_COLUMNS: {
              return create(oldItems, oldItemsDraft => {
                oldItemsDraft.data.visible_columns = updatedItems.setting_value
              })
            }
            default: {
              return oldItems
            }
          }
        }
      )

      return { previousItems }
    }
  })

  return {
    updateDealTableSettings: mutateAsync
  }
}
