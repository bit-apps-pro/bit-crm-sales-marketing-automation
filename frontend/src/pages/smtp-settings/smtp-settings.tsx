import { __ } from '@common/helpers/i18nWrap'
import { Button, Result, Skeleton, Typography } from 'antd'

import useInstallPlugin from './data/use-install-plugin'
import usePluginInfo from './data/use-plugin-info'
import SmtpDescription from './ui/smtp-description'

const PLUGIN_SLUG = 'bit-smtp'

export default function SmtpSettings() {
  const { data, isPluginInfoPending } = usePluginInfo(PLUGIN_SLUG)
  const { installPlugin, isInstalling } = useInstallPlugin(PLUGIN_SLUG)

  const handleInstall = async () => {
    try {
      await installPlugin(PLUGIN_SLUG)
    } catch {
      // Error is handled in the hook
    }
  }

  if (isPluginInfoPending) {
    return (
      <div>
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
          <Typography.Title className="mb-0" level={2}>
            {__('SMTP Settings')}
          </Typography.Title>
        </div>
        <Skeleton active className="mx-6 my-2" />
      </div>
    )
  }

  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
        <Typography.Title className="mb-0" level={2}>
          {__('SMTP Settings')}
        </Typography.Title>
      </div>

      <div className="mx-6 my-2">
        {data?.isInstalled ? (
          <SmtpDescription data={data} />
        ) : (
          <Result
            extra={
              data?.canInstallPlugins ? (
                <Button
                  className="rounded-full"
                  loading={isInstalling}
                  onClick={handleInstall}
                  size="large"
                  type="primary"
                >
                  {__('Install Plugin')}
                </Button>
              ) : (
                <Typography.Text mark strong type="danger">
                  {__(
                    'You do not have permission to install plugins. Please contact the administrator to install the plugin.'
                  )}
                </Typography.Text>
              )
            }
            status="error"
            subTitle={__(
              'Bit SMTP plugin is required to configure SMTP settings. Please install and activate it to continue.'
            )}
            title={__('Bit SMTP Plugin Not Installed')}
          />
        )}
      </div>
    </div>
  )
}
