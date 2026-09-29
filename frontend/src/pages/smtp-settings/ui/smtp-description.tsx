import { __ } from '@common/helpers/i18nWrap'
import useBreakpoint from '@common/hooks/use-breakpoint'
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
  const isSmUp = useBreakpoint('sm')

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
      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Typography.Text className="text-lg" strong>
          {__('Bit SMTP Configuration')}
        </Typography.Text>
        <Button
          className="w-full shrink-0 rounded-full sm:w-auto"
          href={data?.url}
          size="large"
          target="_blank"
          type="primary"
        >
          {__('Configure SMTP Settings')}
        </Button>
      </div>
      <Descriptions
        bordered
        className="mt-4 [&_.ant-descriptions-item-content]:break-words"
        // eslint-disable-next-line translate-obj-prop/translate-obj-prop
        classNames={{ label: 'lg:max-w-16' }}
        column={1}
        items={getItems(config)}
        layout={isSmUp ? 'horizontal' : 'vertical'}
      />
    </div>
  )
}
