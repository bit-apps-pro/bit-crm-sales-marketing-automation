import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type ConversionMappingResponse } from '../shared/types'

export default function useConversionMapping() {
  const { data, isFetching } = useQuery<
    Response<ConversionMappingResponse>,
    Error,
    ConversionMappingResponse
  >({
    queryFn: ({ signal }) =>
      queryRequest('leads/conversion-mapping', {}, undefined, 'GET', {
        signal
      }),
    queryKey: ['leads', 'conversion-mapping'],
    select: res => res?.data
  })

  return {
    conversionMapping: data?.mappings || false,
    isConversionMappingFetching: isFetching
  }
}
