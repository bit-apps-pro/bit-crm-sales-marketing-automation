import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { Alert, Button, Popconfirm } from 'antd'
import { useAtomValue } from 'jotai'
import { useState } from 'react'

import useRemoveSampleData from '../data/use-remove-sample-data'

let dismissedThisLoad = false

export default function SampleDataNotice() {
  const { sampleDataStatus } = useAtomValue($appConfig)
  const [dismissed, setDismissed] = useState(dismissedThisLoad)
  const { isRemovingSampleData, removeSampleData } = useRemoveSampleData()

  if (sampleDataStatus !== 'seeded' || dismissed) return

  const handleClose = () => {
    dismissedThisLoad = true
    setDismissed(true)
  }

  return (
    <Alert
      action={
        <Popconfirm
          cancelText={__('Keep')}
          description={__(
            'All sample records are deleted permanently, including anything you added to them.'
          )}
          okButtonProps={{ danger: true, loading: isRemovingSampleData }}
          okText={__('Delete all')}
          onConfirm={() => removeSampleData()}
          placement="left"
          title={__('Remove sample data?')}
        >
          <Button className="me-1" danger size="small">
            {__('Remove')}
          </Button>
        </Popconfirm>
      }
      closable
      message={__(
        "You're exploring with sample data. Remove it when you're ready to add your own contacts and deals."
      )}
      onClose={handleClose}
      showIcon
      type="info"
    />
  )
}
