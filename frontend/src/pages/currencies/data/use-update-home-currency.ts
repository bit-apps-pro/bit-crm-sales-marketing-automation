import NotifyContext from '@common/context/NotifyContext'
import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormInstance } from 'antd'
import { useAtom } from 'jotai'
import { create } from 'mutative'
import { useContext } from 'react'

import {
  type CurrencyFormType,
  type CurrencyItemType,
  type ResponseDataType
} from '../shared/currency-types'

type CurrenciesResponse = Response<ResponseDataType>

interface MutationContext {
  previousCurrencies: CurrenciesResponse | undefined
}

export default function useUpdateHomeCurrency(form: FormInstance) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)
  const [, setAppConfig] = useAtom($appConfig)

  const { isPending, mutateAsync } = useMutation<
    Response<CurrencyItemType>,
    Response<string | ValidationType<CurrencyItemType>>,
    CurrencyFormType,
    MutationContext
  >({
    mutationFn: currency => queryRequest('currencies/update-home-currency', currency, undefined, 'POST'),
    mutationKey: ['currencies', 'update-home-currency'],
    onError: (error, _currency, context) => {
      if (context?.previousCurrencies) {
        queryClient.setQueryData(['currencies'], context.previousCurrencies)
      }

      if (error.data instanceof Object) {
        const errors = Object.entries(error.data).map(([key, messages]) => ({
          errors: messages,
          name: key
        }))

        form.setFields(errors)
        return
      }

      messageApi?.error(error.message || __('Failed to update home currency'))
    },
    onMutate: async currency => {
      await queryClient.cancelQueries({ queryKey: ['currencies'] })
      const previousCurrencies = queryClient.getQueryData<CurrenciesResponse>(['currencies'])

      queryClient.setQueryData(['currencies'], (prev: CurrenciesResponse | undefined) => {
        if (!prev?.data?.homeCurrencyData) return prev

        return create(prev, draft => {
          const homeDraft = draft.data.homeCurrencyData

          if (!homeDraft || Array.isArray(homeDraft)) return

          homeDraft.decimal_places = currency.decimal_places
          homeDraft.decimal_separator = currency.decimal_separator
          homeDraft.symbol = currency.symbol
          homeDraft.thousand_separator = currency.thousand_separator
        })
      })

      return { previousCurrencies }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    },
    onSuccess: data => {
      if (typeof data?.data === 'object' && data?.data?.currency) {
        setAppConfig(prev => ({ ...prev, homeCurrencyData: data?.data }))
      }
      messageApi?.success(__('Home currency updated successfully'))
    }
  })

  return {
    isUpdatingHomeCurrency: isPending,
    updateHomeCurrency: mutateAsync
  }
}
