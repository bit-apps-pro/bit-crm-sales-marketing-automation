import { __ } from '@common/helpers/i18nWrap'
import { type PluginInfo } from '@features/plugin-activation-guard/shared/types'
import If from '@utilities/If'
import { Alert, Button, Descriptions, Typography } from 'antd'

interface Config {
  [key: string]: unknown
  from_email_address: string
  from_name: string
  smtp_user_name: string
  status: boolean
}

const getItems = (info: Config) => {
  return [
    {
      children: info.smtp_user_name || __('Not Set'),
      key: 'form-email-address',
      label: __('Form Email Address')
    },
    {
      children: info.from_name || __('Not Set'),
      key: 'from-name',
      label: __('From Name')
    },
    {
      children: info.smtp_user_name || __('Not Set'),
      key: 'smtp-username',
      label: __('SMTP Username')
    }
  ]
}

const getConfig = (data: PluginInfo): Config | undefined => {
  const config = data.additionalInfo?.smtpConfig

  if (!config || Object.keys(config).length === 0) {
    return
  }

  return config as Config
}

const isEnabled = (config: Config) => {
  return 'status' in config && config.status === true
}

export default function SmtpDescription({ data }: { data: PluginInfo }) {
  const config = getConfig(data)

  if (!config) {
    return (
      <Alert
        action={
          <Button className="rounded-full" href={data?.url} size="large" target="_blank" type="primary">
            {__('Configure SMTP Settings')}
          </Button>
        }
        description={__(
          'Bit SMTP is installed and active, but it hasn’t been configured yet. Please set up the SMTP settings to send emails.'
        )}
        message={__('No SMTP Configuration Found.')}
        showIcon
        type="warning"
      />
    )
  }

  return (
    <div>
      <If conditions={!isEnabled(config)}>
        <Alert
          className="mt-4"
          message={__('Bit SMTP is not enabled. Please enable it to send emails via SMTP.')}
          showIcon
          type="warning"
        />
      </If>
      <If conditions={isEnabled(config)}>
        <Typography.Text className="mt-4 block text-base" strong>
          {__(
            'Email delivery for both Bit CRM and WordPress is currently handled via the Bit SMTP plugin.'
          )}
        </Typography.Text>
      </If>
      <Descriptions
        bordered
        className="mt-4"
        // eslint-disable-next-line translate-obj-prop/translate-obj-prop
        classNames={{ label: 'lg:max-w-16', title: 'text-lg' }}
        column={1}
        extra={
          <Button className="rounded-full" href={data?.url} size="large" target="_blank" type="primary">
            {__('Configure SMTP Settings')}
          </Button>
        }
        items={getItems(config)}
        title={__('Bit SMTP Configuration')}
      />
    </div>
  )
}
