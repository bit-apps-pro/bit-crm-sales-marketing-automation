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

export default function useSaveTerm(form: FormInstance) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)

  const { isPending, mutateAsync } = useMutation<
    Response<string>,
    Response<string> | Response<ValidationType<Term>>,
    Term,
    MutationContext
  >({
    mutationFn: term => queryRequest('invoices/terms/store', term, undefined, 'POST'),
    mutationKey: ['invoices', 'terms', 'store'],
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

      messageApi?.error(error.message || __('Failed to create term'))
    },
    onMutate: async newTerm => {
      await queryClient.cancelQueries({ queryKey: ['invoices', 'terms'] })

      const previousTerms = queryClient.getQueryData<TermsResponse>(['invoices', 'terms'])

      queryClient.setQueryData(['invoices', 'terms'], (old: TermsResponse | undefined) => {
        if (!old?.data) return old

        return create(old, draft => {
          draft.data.push(newTerm)
        })
      })

      return { previousTerms }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'terms'] })
    },
    onSuccess: () => {
      messageApi?.success(__('Term created successfully'))
    }
  })

  return { isSavingTerm: isPending, saveTerm: mutateAsync }
}
