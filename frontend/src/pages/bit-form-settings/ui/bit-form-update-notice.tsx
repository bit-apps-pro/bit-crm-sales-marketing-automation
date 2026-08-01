import { __ } from '@common/helpers/i18nWrap'
import bitFormLogo from '@resource/img/Bit-Form-Main-logo.svg'
import { Button, Result } from 'antd'

interface BitFormUpdateNoticeProps {
  onRecheck: () => void
}

export default function BitFormUpdateNotice({ onRecheck }: BitFormUpdateNoticeProps) {
  return (
    <Result
      extra={[
        <Button
          className="rounded-full"
          href="plugins.php"
          key="plugins"
          rel="noreferrer"
          target="_blank"
          type="primary"
        >
          {__('Open plugins page')}
        </Button>,
        <Button className="rounded-full" key="recheck" onClick={onRecheck}>
          {__('Check again')}
        </Button>
      ]}
      icon={
        <img
          alt={__('Bit Form')}
          className="mx-auto h-12 w-auto max-w-[220px] object-contain"
          src={bitFormLogo}
        />
      }
      subTitle={__(
        'The installed Bit Form version does not support the CRM integration yet. Update Bit Form to the latest version to manage lead-capture forms from here.'
      )}
      title={__('Update Bit Form')}
    />
  )
}
