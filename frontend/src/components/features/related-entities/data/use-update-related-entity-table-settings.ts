import NotifyContext from '@common/context/NotifyContext'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FieldItem } from '@common/types/types'
import { type Order } from '@features/form-builder/shared/field-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

interface VisibleColumnsSetting {
  setting_key: `${string}_${string}_table_visible_columns`
  setting_value: string[]
}

interface ColumnsOrderSetting {
  setting_key: `${string}_${string}_table_columns_order`
  setting_value: Order[]
}

export type SettingsData = ColumnsOrderSetting | VisibleColumnsSetting

interface ResponseType {
  data: {
    fields: FieldItem[]
    orders: Order[]
    visible_columns: string[]
  }
}

export default function useUpdateRelatedEntityTableSettings({
  entity,
  relatedEntity
}: {
  entity: string
  relatedEntity: string
}) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation<
    Response<SettingsData>,
    Response<string>,
    SettingsData,
    { previousItems: ResponseType | undefined }
  >({
    mutationFn: (settingsData: SettingsData) => queryRequest('settings/upsert', settingsData),
    mutationKey: ['settings', 'upsert'],
    onError: (error, _, context) => {
      queryClient.setQueryData(
        ['common', 'related-entities', 'table-fields', relatedEntity, entity],
        context?.previousItems
      )
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({
        queryKey: ['common', 'related-entities', 'table-fields', relatedEntity, entity]
      })
      const previousItems = queryClient.getQueryData<ResponseType>([
        'common',
        'related-entities',
        'table-fields',
        relatedEntity,
        entity
      ])
      queryClient.setQueryData(
        ['common', 'related-entities', 'table-fields', relatedEntity, entity],
        (oldItems: ResponseType) => {
          if (updatedItems.setting_key === `${entity}_${relatedEntity}_table_visible_columns`) {
            return create(oldItems, draft => {
              draft.data.visible_columns = updatedItems.setting_value as string[]
            })
          }
          if (updatedItems.setting_key === `${entity}_${relatedEntity}_table_columns_order`) {
            return create(oldItems, draft => {
              draft.data.orders = updatedItems.setting_value as Order[]
            })
          }
          return oldItems
        }
      )
      return { previousItems }
    }
  })

  return {
    updateRelatedEntityTableSettings: mutateAsync
  }
}
