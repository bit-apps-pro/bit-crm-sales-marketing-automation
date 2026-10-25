import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type Option } from '@features/field-settings/shared/field-types'
import { useQueries } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

type Country = null | string | undefined

const combineStates = (results: { data?: Response<Option[]>; isLoading: boolean }[]) => ({
  isLoading: results.some(result => result.isLoading),
  states: results.map(result => result.data?.data)
})

export default function useStates(countries: Country | Country[]) {
  const countryKey = [...new Set([countries].flat().filter(Boolean))].join('|')
  const countryList = useMemo(() => (countryKey ? countryKey.split('|') : []), [countryKey])

  const { isLoading, states } = useQueries({
    combine: combineStates,
    queries: countryList.map(country => ({
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        queryRequest<Option[]>('common/states', undefined, { country }, 'GET', { signal }),
      queryKey: ['common', 'states', country],
      staleTime: 20 * 60 * 1000
    }))
  })

  const statesByCountry = useMemo(
    () => new Map(countryList.map((country, index) => [country, states[index] ?? []])),
    [countryList, states]
  )

  const getStateOptions = useCallback(
    (country?: Country): Option[] => statesByCountry.get(country ?? '') ?? [],
    [statesByCountry]
  )

  const getStateLabel = useCallback(
    (country?: Country, value?: null | string) =>
      statesByCountry.get(country ?? '')?.find(state => state.value === value)?.label ?? value ?? '',
    [statesByCountry]
  )

  return { getStateLabel, getStateOptions, isStatesLoading: isLoading }
}
