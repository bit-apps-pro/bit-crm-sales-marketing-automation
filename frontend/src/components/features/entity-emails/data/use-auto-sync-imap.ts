import queryRequest, { type Response } from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

interface Payload {
  autoSync: boolean
  email: string
  imap_id: number
  module: string
}

export default function useAutoSyncImap(payload: Payload, enabled: boolean) {
  const { data, isFetching } = useQuery({
    enabled,
    queryFn: () =>
      queryRequest('imaps/fetch-imap', payload).catch(
        error => error as Response<ValidationType<Payload>>
      ),
    queryKey: ['sync_imap', payload.email, payload.imap_id],
    retry: false,
    retryOnMount: true
  })

  return {
    autoSyncImapResponse: data,
    isAutoSyncingImap: isFetching
  }
}
