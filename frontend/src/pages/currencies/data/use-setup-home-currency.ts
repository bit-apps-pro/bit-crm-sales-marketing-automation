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

export default function useSetupHomeCurrency(form: FormInstance) {
  const queryClient = useQueryClient()
  const { messageApi } = useContext(NotifyContext)
  const [, setAppConfig] = useAtom($appConfig)

  const { isPending, mutateAsync } = useMutation<
    Response<CurrencyItemType>,
    Response<string | ValidationType<CurrencyFormType>>,
    CurrencyItemType,
    MutationContext
  >({
    mutationFn: currencyData =>
      queryRequest('currencies/store-home-currency', currencyData, undefined, 'POST'),
    mutationKey: ['currencies', 'store-home-currency'],
    onError: (error, _newCurrency, context) => {
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

      messageApi?.error(error.message || __('Failed to setup home currency'))
    },
    onMutate: async homeCurrency => {
      await queryClient.cancelQueries({ queryKey: ['currencies'] })
      const previousCurrencies = queryClient.getQueryData<CurrenciesResponse>(['currencies'])

      const temporaryCurrency: CurrencyItemType = {
        ...homeCurrency,
        is_active: true,
        label: `${homeCurrency.currency}`
      }

      queryClient.setQueryData(['currencies'], (prev: CurrenciesResponse | undefined) => {
        if (!prev?.data?.homeCurrencyData) return prev

        return create(prev, draft => {
          draft.data.homeCurrencyData = temporaryCurrency
          draft.data.homeCurrency = homeCurrency.currency
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

      messageApi?.success(__('Home currency setup successfully'))
    }
  })

  return {
    isSettingUpHomeCurrency: isPending,
    setupHomeCurrency: mutateAsync
  }
}
