import { MODULES } from '@common/constants/modules'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { IMAP_FETCH_STATUS } from '@pages/lead/shared/constants'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getEmailCapability } from '../shared/common-functions'

interface NoticeQueue {
  batchKey: string
  message: string
  status: string
}

export default function useNoticeQueue(batchKey: string) {
  const queryClient = useQueryClient()

  const { data, error, isError, isFetched, isFetching, isPending, isSuccess } = useQuery<
    Response<NoticeQueue>,
    Error,
    NoticeQueue
  >({
    enabled: checkCapability(getEmailCapability(MODULES.LEAD)),
    queryFn: ({ signal }) => queryRequest('imaps/queue-notice', {}, { batchKey }, 'GET', { signal }),
    queryKey: ['imaps', 'queue-notice', batchKey],
    refetchInterval: 5000,
    select: res => res.data
  })

  useEffect(() => {
    if (isSuccess && data && !isFetching) {
      if (data.status === IMAP_FETCH_STATUS.IDLE || data.status === IMAP_FETCH_STATUS.ERROR) return

      queryClient.invalidateQueries({ queryKey: ['emails', 'index'] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched, data, isFetching])

  if (isError) {
    console.error(error)
  }

  return {
    isFetchingNotice: isPending,
    isSuccess,
    notice: data
  }
}
