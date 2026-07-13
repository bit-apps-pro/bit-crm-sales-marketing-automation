import CAPABILITIES from '@common/constants/capabilities'
import NotifyContext from '@common/context/NotifyContext'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FilterCondition } from '@features/advanced-filter/shared/types'
import { useAdvancedFilterActions } from '@features/advanced-filter/state/use-advanced-filter-store'
import { type CompanyType } from '@pages/company/shared/company-types'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'

interface SearchData {
  page: number
  perPage: number
  searchTerm: string
  sortBy: string
  sortOrder: string
}

export interface CompanyResponse {
  current_page: number
  current_total: number
  data: CompanyType[]
  last_page: number
  pages: number
  per_page: number
  total: number
}

type ResponseError = Response<ValidationType<SearchData & { advancedFilterGroups: FilterCondition[][] }>>

export default function useCompanies(searchData: SearchData, advancedFilterGroups: FilterCondition[][]) {
  const { setGroupErrors } = useAdvancedFilterActions()
  const { messageApi } = useContext(NotifyContext)

  const { data, error, isError, isFetching, isPending, refetch } = useQuery<
    Response<CompanyResponse>,
    ResponseError,
    CompanyResponse
  >({
    enabled: checkCapability(CAPABILITIES.COMPANY.VIEW),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest('companies/search', { ...searchData, advancedFilterGroups }, undefined, 'POST', {
        signal
      }),
    queryKey: ['companies', searchData, advancedFilterGroups],
    retry: false,
    select: response => response.data
  })

  useEffect(() => {
    if (isError && error?.code === 'VALIDATION') {
      messageApi?.error('Invalid filters! failed to fetch companies.')
      const filteredErrors = Object.fromEntries(
        Object.entries(error.data).filter(([key]) => key.startsWith('advancedFilterGroups'))
      )
      setGroupErrors(filteredErrors)
    } else {
      setGroupErrors({})
    }
  }, [isError, error, setGroupErrors, messageApi])

  return {
    companies: data?.data || [],
    isCompaniesError: isError,
    isCompaniesFetching: isFetching,
    isCompaniesPending: isPending,
    refetchCompanies: refetch,
    totalCompanies: data?.total || 0
  }
}
