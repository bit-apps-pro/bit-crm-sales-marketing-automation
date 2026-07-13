import { checkCapability } from '@common/helpers/capabilityHelper'
import queryRequest from '@common/helpers/request'
import { type Attachment } from '@features/wp-media-uploader/state/use-attachment-store'
import { useQuery } from '@tanstack/react-query'

import { getEmailCapability } from '../shared/common-functions'
import { type EntityModule } from '../shared/types'

interface QueryParam {
  entity_email: string
  imap_id: number
  module: EntityModule
  page: number
  perPage: number
  searchTerm?: string
  source?: string
}

export interface Email {
  attachments?: Attachment[]
  body?: string
  email_date: string
  email_direction: string
  email_uid: number
  entity_email: string
  entity_name: string
  id: number
  imap_id: number
  imap_username: string
  sender_name?: string
  sent_from?: string
  subject: string
}

interface EmailsResType {
  data: {
    data: Email[]
    total: number
  }
}

export default function useEmails(payload: QueryParam) {
  const emailCapability = getEmailCapability(payload.module)

  const { data, isFetching, isPending, isSuccess, refetch } = useQuery<EmailsResType>({
    enabled: !!payload.entity_email && checkCapability(emailCapability),
    queryFn: () => queryRequest('emails/index', payload, undefined, 'POST'),
    queryKey: ['emails', 'index', payload]
  })

  return {
    emails: data?.data?.data || [],
    isEmailsFetching: isFetching,
    isEmailsPending: isPending,
    isEmailsSuccess: isSuccess,
    refetchEmails: refetch,
    totalEmails: data?.data?.total || 0
  }
}
