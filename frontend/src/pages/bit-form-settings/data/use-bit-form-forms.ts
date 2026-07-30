import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { BITFORM_ABSENT_CODE, type BitFormApiError, type BitFormFormsResponse } from '../shared/types'

export const bitFormFormsQueryKey = ['bit-form', 'forms']

export default function useBitFormForms() {
  const { data, error, isFetching, isPending, refetch } = useQuery<
    Response<BitFormFormsResponse>,
    BitFormApiError,
    BitFormFormsResponse
  >({
    enabled: checkCapability(CAPABILITIES.SETTING.INTEGRATION),
    queryFn: ({ signal }) => queryRequest('bit-form/forms', undefined, undefined, 'GET', { signal }),
    queryKey: bitFormFormsQueryKey,
    retry: false,
    select: response => response.data
  })

  return {
    bitformProActive: data?.bitformProActive ?? false,
    forms: data?.forms ?? [],
    formsError: error ?? undefined,
    isBitFormOutdated: error?.code === BITFORM_ABSENT_CODE,
    isFormsFetching: isFetching,
    isFormsPending: isPending,
    refetchForms: refetch
  }
}
