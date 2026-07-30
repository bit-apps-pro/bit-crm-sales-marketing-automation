import queryRequest from '@common/helpers/request'
import { useMutation } from '@tanstack/react-query'

interface Payload {
  autoSync: boolean
  email: string
  imap_id: number
  module: string
}

export default function useSyncImap() {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (payload: Payload) => queryRequest('imaps/fetch-imap', payload),
    mutationKey: ['sync_imap']
  })

  return {
    isSyncingImap: isPending,
    syncImap: mutateAsync
  }
}
