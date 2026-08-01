import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { Switch } from 'antd'
import { useState } from 'react'

import useStatusUpdateImap from '../data/use-status-update-imap'

interface ImapItemStatusSwitchProps {
  id: number
  status: boolean
}

export default function ImapItemStatusSwitch({ id, status }: ImapItemStatusSwitchProps) {
  const [isChecked, setChecked] = useState<boolean>(status)
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
