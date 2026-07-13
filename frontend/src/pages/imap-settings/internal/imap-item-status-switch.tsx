import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { Switch } from 'antd'
import { useState } from 'react'

import useStatusUpdateImap from '../data/use-status-update-imap'

export default function ImapItemStatusSwitch({ id, status }: { id: number; status: string }) {
  const [isChecked, setChecked] = useState(status === '1')
  const { updateStatus } = useStatusUpdateImap()

  const handleStatusUpdate = async () => {
    if (id === 0) return

    setChecked(!isChecked)

    await updateStatus({ id, status: !isChecked })
  }

  if (!checkCapability(CAPABILITIES.SETTING.IMAP)) {
    return
  }

  return <Switch checked={isChecked} onChange={handleStatusUpdate} size="small" />
}
