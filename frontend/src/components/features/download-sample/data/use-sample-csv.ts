import queryRequest, { type Response } from '@common/helpers/request'
import { type SampleFileName } from '@features/download-sample/shared/constants'
import { useQuery } from '@tanstack/react-query'

interface SampleCsvResponse {
  download_url: string
}

export default function useSampleCsv(fileName: SampleFileName) {
  const { data, isLoading } = useQuery<Response<SampleCsvResponse>>({
    queryFn: ({ signal }) =>
      queryRequest('common/sample-csv', undefined, { fileName }, 'GET', { signal }),
    queryKey: ['common', 'sample-csv', fileName],
    retry: false
  })

  return {
    downloadUrl: data?.data?.download_url || '',
    isLoading
  }
}
