/* eslint-disable no-param-reassign */
import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { type Order } from '@features/form-builder/shared/field-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

export type SettingsData =
  | {
      setting_key: 'company_table_columns_order'
      setting_value: Order[]
    }
  | {
      setting_key: 'company_table_visible_columns'
      setting_value: string[]
    }

interface ResponseType {
  data: {
    fields: FieldItem[]
    orders: Order[]
    visible_columns: string[]
  }
}

export default function useUpdateCompanyTableSettings() {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation<
    Response<SettingsData>,
    Response<string> | Response<ValidationType<SettingsData>>,
    SettingsData,
    { previousItems: ResponseType | undefined }
  >({
    mutationFn: (settingsData: SettingsData) => queryRequest('settings/upsert', settingsData),
    mutationKey: ['update_company_table'],
    onError: (error, _, context) => {
      queryClient.setQueryData(['company', 'table-fields'], context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({ queryKey: ['company', 'table-fields'] })
      const previousItems = queryClient.getQueryData<ResponseType>(['company', 'table-fields'])
      queryClient.setQueryData(['company', 'table-fields'], (oldItems: ResponseType) => {
        if (updatedItems.setting_key === 'company_table_visible_columns') {
          return create(oldItems, oldItemsDraft => {
            oldItemsDraft.data.visible_columns = updatedItems.setting_value
          })
        }

        if (updatedItems.setting_key === 'company_table_columns_order') {
          return create(oldItems, oldItemsDraft => {
            oldItemsDraft.data.orders = updatedItems.setting_value
          })
        }
      })

      return { previousItems }
    }
  })

  return {
    updateCompanyTableSettings: mutateAsync
  }
}
