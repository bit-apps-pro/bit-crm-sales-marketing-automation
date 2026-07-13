import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Empty } from 'antd'
import { Link } from 'react-router'

const EmptyImapSelect = () => {
  return (
    <Empty
      className="my-1"
      description={__('No active Imap settings found')}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    >
      {checkCapability(CAPABILITIES.SETTING.IMAP) && (
        <Link target="_blank" to="/settings/imap-settings?modal=create">
          <Button type="primary">{__('Create')}</Button>
        </Link>
      )}
    </Empty>
  )
}

export default EmptyImapSelect
