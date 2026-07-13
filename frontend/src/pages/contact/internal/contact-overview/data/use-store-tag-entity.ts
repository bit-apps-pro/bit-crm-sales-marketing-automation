import NotifyContext from '@common/context/NotifyContext'
import { slugify } from '@common/helpers/globalHelpers'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type ContactResType } from '@pages/contact/shared/contact-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

interface TagEntityData {
  contact_id?: string
  title: string
}

export default function useStoreTagEntity(contactId: string | undefined) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<TagEntityData>,
    Response<string> | Response<ValidationType<TagEntityData>>,
    TagEntityData,
    { previousItems: ContactResType | undefined }
  >({
    mutationFn: (tagEntityData: TagEntityData) => queryRequest('contacts/attach-tag', tagEntityData),
    mutationKey: ['contacts', 'attach-tag'],
    onError: (error, _, context) => {
      queryClient.setQueryData(['contact', contactId], context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: updatedItems => {
      queryClient.cancelQueries({ queryKey: ['contact', contactId] })
      const previousItems = queryClient.getQueryData<ContactResType>(['contact', contactId])

      queryClient.setQueryData(['contact', contactId], (oldItems: ContactResType) => {
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
