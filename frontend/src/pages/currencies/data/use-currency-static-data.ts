import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type CurrencyItemType, type CurrencyStaticDataType } from '../shared/currency-types'

interface ResponseData {
  staticData: Record<string, CurrencyStaticDataType>
  storedCurrencies: CurrencyItemType[]
}

interface CurrencyStaticDataResult {
  currencyOptions: { label: string; value: string }[]
  currencyStaticData: Record<string, CurrencyStaticDataType>
}

export default function useCurrencyStaticData() {
  const { data, isError, isFetching, isLoading } = useQuery<
    Response<ResponseData>,
    Error,
    CurrencyStaticDataResult
  >({
    queryFn: ({ signal }) =>
      queryRequest('currencies/static-data', undefined, undefined, 'GET', { signal }),
    queryKey: ['currencies', 'static-data'],
    select: res => {
      const { staticData, storedCurrencies } = res.data
      const currencyStaticData = staticData
      const storedCurrencyCodes = new Set(storedCurrencies.map(currency => currency.currency))

      const currencyOptions = Object.values(currencyStaticData)
        .filter(currency => !storedCurrencyCodes.has(currency.value))
        .map(currency => ({
          label: currency.label,
          value: currency.value
        }))

      return {
        currencyOptions,
        currencyStaticData
      }
    },
    staleTime: 20 * 60 * 1000 // 20 minutes - static data doesn't change often
  })

  return {
    currencyOptions: data?.currencyOptions || [],
    currencyStaticData: data?.currencyStaticData || {},
    isCurrencyStaticDataError: isError,
    isCurrencyStaticDataFetching: isFetching,
    isCurrencyStaticDataLoading: isLoading
  }
}
