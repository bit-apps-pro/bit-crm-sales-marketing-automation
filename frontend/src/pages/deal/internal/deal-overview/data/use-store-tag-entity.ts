import { MODULES } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { slugify } from '@common/helpers/globalHelpers'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type DealRes } from '@pages/deal/shared/deal-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

interface TagEntityData {
  deal_id?: string
  title: string
}

export default function useStoreTagEntity(dealId: number | string) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<TagEntityData>,
    Response<string> | Response<ValidationType<TagEntityData>>,
    TagEntityData,
    { previousItems: DealRes | undefined }
  >({
    mutationFn: payload => queryRequest('deals/attach-tag', payload),
    mutationKey: ['deals', 'attach-tag'],
    onError: (error, _, context) => {
      queryClient.setQueryData(['deal', dealId], context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({ queryKey: ['deal', dealId] })
      const previousItems = queryClient.getQueryData<DealRes>(['deal', dealId])

      queryClient.setQueryData(['deal', dealId], (oldItems: DealRes) => {
        if (oldItems.data.tags?.length) {
          return create(oldItems, oldItemsDraft => {
            oldItemsDraft.data.tags.push({
              slug: slugify(updatedItems.title),
              title: updatedItems.title
            })
          })
        }
        return create(oldItems, oldItemsDraft => {
          // eslint-disable-next-line no-param-reassign
          oldItemsDraft.data.tags = [
            {
              slug: slugify(updatedItems.title),
              title: updatedItems.title
            }
          ]
        })
      })

      return { previousItems }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', Number(dealId)] })
      queryClient.invalidateQueries({ queryKey: ['tags', MODULES.DEAL] })
      messageApi?.success('Tag added successfully')
    }
  })

  return {
    isTagEntityStoring: isPending,
    storeTagEntity: mutateAsync
  }
}
