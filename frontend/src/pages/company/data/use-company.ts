/* eslint-disable no-param-reassign */
import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import queryRequest from '@common/helpers/request'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { type CompanyResType, type CompanyType } from '../shared/company-types'

function processData(obj: Record<string, unknown>): CompanyType {
  Object.entries(obj).forEach(([key, value]) => {
    if (
      value instanceof Object &&
      'field_type' in value &&
      (value as { field_type?: string }).field_type === 'date'
    ) {
      obj[key] = (value as { field_value?: string }).field_value
        ? dayjs((value as { field_value?: string }).field_value)
        : ''
    }
  })
  return obj as CompanyType
}

export default function useCompany(companyId: number | string) {
  const { data, isError, isFetching, isPending, refetch }: UseQueryResult<CompanyResType, Error> =
    useQuery<CompanyResType, Error>({
      enabled: companyId !== 0 && !!companyId && checkCapability(CAPABILITIES.COMPANY.VIEW),
      queryFn: ({ signal }) =>
        queryRequest(`companies/${companyId}`, undefined, undefined, 'GET', { signal }),
      queryKey: ['companies', companyId],
      retry: false,
      select: res => {
        res.data = processData(res.data)
        return res
      }
    })

  return {
    company: data?.data,
    isCompanyError: isError,
    isCompanyFetching: isFetching,
    isCompanyPending: isPending,
    refetchCompany: refetch
  }
}
