import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

export interface Imap {
  id: number
  platform: string
  status: boolean
  title: string
  username: string
  visibility: boolean
}

interface ImapResType {
  data: Imap[]
}

export default function useImapSettings() {
  const { data, isFetching, isPending } = useQuery<ImapResType>({
    enabled: checkCapability(CAPABILITIES.SETTING.MENU),
    queryFn: () => queryRequest('imaps/list', undefined, undefined, 'GET'),
    queryKey: ['imap_list']
  })

  return {
    imaps: data?.data || [],
    isImapsFetching: isFetching,
    isImapsPending: isPending,
    totalImaps: data?.data?.length || 0
  }
}
