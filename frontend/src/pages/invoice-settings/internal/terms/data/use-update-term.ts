import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import queryRequest, { type Response } from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { create } from 'mutative'
import { useContext } from 'react'

import { type Term } from '../shared/types'

interface TermsResponse {
  data: Term[]
}

interface MutationContext {
  previousTerms: TermsResponse | undefined
}

export default function useUpdateTerm(form: FormInstance) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string> | Response<ValidationType<Term>>,
    Term,
    MutationContext
  >({
    mutationFn: term => queryRequest('invoices/terms/update', term, undefined, 'POST'),
    mutationKey: ['invoices', 'terms', 'update'],
    onError: (error, _newTerm, context) => {
      if (context?.previousTerms) {
        queryClient.setQueryData(['invoices', 'terms'], context.previousTerms)
      }

      if (error.data instanceof Object) {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))
        form.setFields(errors)
        return
      }

      messageApi?.error(error.message || __('Failed to update term'))
    },
    onMutate: async updatedTerm => {
      await queryClient.cancelQueries({ queryKey: ['invoices', 'terms'] })

      const previousTerms = queryClient.getQueryData<TermsResponse>(['invoices', 'terms'])

      queryClient.setQueryData(['invoices', 'terms'], (old: TermsResponse | undefined) => {
        if (!old?.data) return old

        return create(old, draft => {
          const index = draft.data.findIndex((term: Term) => term.key === updatedTerm.key)
          if (index !== -1) {
            draft.data[index] = { ...draft.data[index], ...updatedTerm }
          }
        })
      })

      return { previousTerms }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'terms'] })
    },
    onSuccess: () => {
      messageApi?.success(__('Term updated successfully'))
    }
  })

  return { isUpdatingTerm: isPending, updateTerm: mutateAsync }
}
