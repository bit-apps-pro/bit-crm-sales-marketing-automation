import NotifyContext from '@common/context/NotifyContext'
import { slugify } from '@common/helpers/globalHelpers'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type LeadResType } from '@pages/lead/shared/lead-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

interface TagEntityData {
  lead_id?: string
  title: string
}

export default function useStoreTagEntity(leadId: string | undefined) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<TagEntityData>,
    Response<string> | Response<ValidationType<TagEntityData>>,
    TagEntityData,
    { previousItems: LeadResType | undefined }
  >({
    mutationFn: (tagEntityData: TagEntityData) => queryRequest('leads/attach-tag', tagEntityData),
    mutationKey: ['leads', 'attach-tag'],
    onError: (error, _, context) => {
      queryClient.setQueryData(['lead', leadId], context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({ queryKey: ['lead', leadId] })
      const previousItems = queryClient.getQueryData<LeadResType>(['lead', leadId])

      queryClient.setQueryData(['lead', leadId], (oldItems: LeadResType) => {
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
      messageApi?.success('Tag added successfully')
    }
  })

  return {
    isTagEntityStoring: isPending,
    storeTagEntity: mutateAsync
  }
}
