import NotifyContext from '@common/context/NotifyContext'
import { slugify } from '@common/helpers/globalHelpers'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type CompanyResType } from '@pages/company/shared/company-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext } from 'react'

interface TagEntityData {
  company_id?: string
  title: string
}

export default function useStoreTagEntity(companyId: number) {
  const { messageApi } = useContext(NotifyContext)
  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation<
    Response<TagEntityData>,
    Response<string> | Response<ValidationType<TagEntityData>>,
    TagEntityData,
    { previousItems: CompanyResType | undefined }
  >({
    mutationFn: (tagEntityData: TagEntityData) => queryRequest('companies/attach-tag', tagEntityData),
    mutationKey: ['companies', 'attach-tag'],
    onError: (error, _, context) => {
      queryClient.setQueryData(['companies', companyId], context?.previousItems)
      if (typeof error.data === 'string') messageApi?.error(error.message || error.data)
    },
    onMutate: async newItem => {
      await queryClient.cancelQueries({ queryKey: ['companies', companyId] })

      const previousItems = queryClient.getQueryData<CompanyResType>(['companies', companyId])

      if (previousItems) {
        queryClient.setQueryData<CompanyResType>(['companies', companyId], oldData =>
          create(oldData, draft => {
            if (draft?.data?.tags) {
              draft.data.tags.push({
                id: Date.now(),
                slug: slugify(newItem.title),
                title: newItem.title
              })
            }
          })
        )
      }

      return { previousItems }
    },
    onSuccess: data => {
      if (typeof data.data === 'string') messageApi?.success('Tag added successfully')
    }
  })

  return {
    isTagEntityStoring: isPending,
    storeTagEntity: mutateAsync
  }
}
