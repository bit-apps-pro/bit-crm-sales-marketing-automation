import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type ResponseDataType } from '../shared/currency-types'

export default function useCurrencies() {
  const { data, isError, isFetching, isLoading, refetch } = useQuery<
    Response<ResponseDataType>,
    Error,
    ResponseDataType
  >({
    queryFn: ({ signal }) => queryRequest('currencies/index', undefined, undefined, 'GET', { signal }),
    queryKey: ['currencies'],
    select: res => res.data
  })

  return {
    currencies: data?.otherCurrencies || [],
    homeCurrency: data?.homeCurrencyData,
    homeCurrencyCode: data?.homeCurrency,
    isCurrenciesError: isError,
    isCurrenciesFetching: isFetching,
    isCurrenciesLoading: isLoading,
    refetchCurrencies: refetch
  }
}
