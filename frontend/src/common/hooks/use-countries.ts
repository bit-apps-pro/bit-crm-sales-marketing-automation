import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Option } from '@features/field-settings/shared/field-types'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

const EMPTY_OPTIONS: Option[] = []

export default function useCountries() {
  const { data: countryOptions = EMPTY_OPTIONS, isLoading } = useQuery<
    Response<Option[]>,
    Error,
    Option[]
  >({
    queryFn: ({ signal }) => queryRequest('common/countries', undefined, undefined, 'GET', { signal }),
    queryKey: ['common', 'countries'],
    select: res => res.data,
    staleTime: 20 * 60 * 1000
  })

  const getCountryLabel = useCallback(
    (value?: null | string) =>
      countryOptions.find(country => country.value === value)?.label ?? value ?? '',
    [countryOptions]
  )

  return {
    countryOptions,
    getCountryLabel,
    isCountriesLoading: isLoading
  }
}
