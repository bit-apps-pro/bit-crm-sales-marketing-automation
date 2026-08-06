import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type ImapType } from '../shared/imap-type'
import useImapStore from '../state/use-imap-store'

export default function useImap(id: number) {
  const { isEditModalOpen } = useImapStore()
  const { data, isLoading } = useQuery<Response<ImapType>, Error, ImapType>({
    enabled: isEditModalOpen && checkCapability(CAPABILITIES.SETTING.IMAP),
    queryFn: ({ signal }) => queryRequest(`imaps/edit/${id}`, {}, undefined, 'GET', { signal }),
    queryKey: ['imap', 'edit', id],
    retry: false,
    select: res => res.data
  })

  return {
    imap: data,
    isImapLoading: isLoading
  }
}
