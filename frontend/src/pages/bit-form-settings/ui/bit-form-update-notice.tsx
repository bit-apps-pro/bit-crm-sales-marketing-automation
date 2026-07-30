import { __ } from '@common/helpers/i18nWrap'
import { Button, Result } from 'antd'

interface BitFormUpdateNoticeProps {
  onRecheck: () => void
}

export default function BitFormUpdateNotice({ onRecheck }: BitFormUpdateNoticeProps) {
  return (
    <Result
      extra={[
        <Button href="plugins.php" key="plugins" rel="noreferrer" target="_blank" type="primary">
          {__('Open plugins page')}
        </Button>,
        <Button key="recheck" onClick={onRecheck}>
          {__('Check again')}
        </Button>
      ]}
      status="warning"
      subTitle={__(
        'The installed Bit Form version does not support the CRM integration yet. Update Bit Form to the latest version to manage lead-capture forms from here.'
      )}
      title={__('Update Bit Form')}
    />
  )
}
