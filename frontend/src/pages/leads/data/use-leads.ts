import CAPABILITIES from '@common/constants/capabilities'
import NotifyContext from '@common/context/NotifyContext'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { type FilterCondition } from '@features/advanced-filter/shared/types'
import { useAdvancedFilterActions } from '@features/advanced-filter/state/use-advanced-filter-store'
import { type LeadType } from '@pages/lead/shared/lead-types'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { create } from 'mutative'
import { useContext, useEffect } from 'react'

interface SearchData {
  page: number
  perPage: number
  searchTerm: string
  sortBy: string
  sortOrder: string
}

export interface LeadResponse {
  current_page: number
  current_total: number
  data: LeadType[]
  last_page: number
  pages: number
  per_page: number
  total: number
}

type ResponseError = Response<ValidationType<SearchData & { advancedFilterGroups: FilterCondition[][] }>>

export default function useLeads(searchData: SearchData, advancedFilterGroups: FilterCondition[][]) {
  const { setGroupErrors } = useAdvancedFilterActions()
  const { messageApi } = useContext(NotifyContext)

  const { data, error, isError, isFetching, isLoading, refetch } = useQuery<
    Response<LeadResponse>,
    ResponseError,
    LeadResponse
  >({
    enabled: checkCapability(CAPABILITIES.LEAD.VIEW),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      queryRequest('leads/search', { ...searchData, advancedFilterGroups }, undefined, 'POST', {
        signal
      }),
    queryKey: ['leads', searchData, advancedFilterGroups],
    retry: false,
    select: response => {
      return create(response.data, draft => {
        draft.data = draft.data.map(lead => ({
          full_name: {
            email: lead?.email,
            first_name: lead?.first_name,
            id: lead.id,
            last_name: lead?.last_name,
            title: lead?.title
          },
          ...lead
        }))
      })
    }
  })

  useEffect(() => {
    if (isError && error?.code === 'VALIDATION') {
      messageApi?.error('Invalid filters! failed to fetch leads.')
      const filteredErrors = Object.fromEntries(
        Object.entries(error.data).filter(([key]) => key.startsWith('advancedFilterGroups'))
      )
      setGroupErrors(filteredErrors)
    } else {
      setGroupErrors({})
    }
  }, [isError, error, setGroupErrors, messageApi])

  return {
    isLeadsError: isError,
    isLeadsFetching: isFetching,
    isLeadsLoading: isLoading,
    leads: data?.data || [],
    refetchLeads: refetch,
    totalLeads: data?.total || 0
  }
}
