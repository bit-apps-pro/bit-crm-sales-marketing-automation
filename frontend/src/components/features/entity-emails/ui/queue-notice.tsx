import { IMAP_FETCH_STATUS } from '@pages/lead/shared/constants'
import If from '@utilities/If'
import { Alert } from 'antd'

import useNoticeQueue from '../data/use-notice-queue'

export default function QueueNotice({ email, imapId }: { email: string; imapId: number | string }) {
  const batchKey = `${email}_${imapId}`
  const { notice } = useNoticeQueue(batchKey)

  return (
    <If
      conditions={
        notice?.status === IMAP_FETCH_STATUS.PROCESSING || notice?.status === IMAP_FETCH_STATUS.ERROR
      }
    >
      <Alert
        className="mb-2"
        message={notice?.message}
        type={IMAP_FETCH_STATUS.PROCESSING ? 'success' : 'error'}
      />
    </If>
  )
}
