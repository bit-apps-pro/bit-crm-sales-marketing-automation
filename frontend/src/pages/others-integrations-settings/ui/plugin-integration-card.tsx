import { CheckCircleFilled, InfoCircleOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import useInstallPlugin from '@features/plugin-activation-guard/data/use-install-plugin'
import usePluginInfo from '@features/plugin-activation-guard/data/use-plugin-info'
import If from '@utilities/If'
import { Button, Card, Skeleton, Tag, theme, Tooltip, Typography } from 'antd'

import { type PluginCard } from '../shared/constants'

export default function PluginIntegrationCard({ description, logo, slug, title }: PluginCard) {
  const { token } = theme.useToken()
  const { data, isPluginInfoError, isPluginInfoFetching, isPluginInfoPending, refetchPluginInfo } =
    usePluginInfo(slug)
  const { installPlugin, isInstalling } = useInstallPlugin(slug)

  const handleInstall = async () => {
    try {
      await installPlugin(slug)
    } catch {
      // Error is handled in the hook
    }
  }

  const isActive = data?.isActive ?? false
  const isInstalled = data?.isInstalled ?? false
  const canInstallPlugins = data?.canInstallPlugins ?? false

  const getStatus = () => {
    if (isPluginInfoError) {
      return { color: 'error', label: __('Status Unavailable') }
    }

    if (isActive) {
      return { color: 'success', label: __('Active') }
    }

    if (isInstalled) {
      return { color: 'warning', label: __('Inactive') }
    }

    return { color: 'default', label: __('Not Installed') }
  }

  const status = getStatus()

  return (
    <Card
      className="h-full border border-solid border-[#E5E3FE] transition-shadow duration-300 ease-out dark:border-neutral-700 dark:bg-neutral-900"
      classNames={{ body: 'flex h-full flex-col' }}
    >
      <If conditions={isPluginInfoPending}>
        <Skeleton active paragraph={{ rows: 3 }} title={{ width: '40%' }} />
      </If>

      <If conditions={!isPluginInfoPending}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <img alt={title} className="h-8 w-auto max-w-[200px] object-contain" src={logo} />
          <Tag className="m-0 shrink-0 text-xs" color={status.color}>
            {status.label}
          </Tag>
        </div>

        <Typography.Paragraph className="mb-4 flex-1" type="secondary">
          {description}
        </Typography.Paragraph>

        <div className="mt-auto border-0 border-t border-solid border-[#E5E3FE] pt-3 dark:border-neutral-700">
          <If conditions={isPluginInfoError}>
            <div className="flex items-center justify-between gap-2">
              <Typography.Text type="danger">
                {__('Could not check this plugin’s status.')}
              </Typography.Text>
              <Button
                className="rounded-full"
                loading={isPluginInfoFetching}
                onClick={() => refetchPluginInfo()}
                size="small"
              >
                {__('Retry')}
              </Button>
            </div>
          </If>

          <If conditions={!isPluginInfoError && isActive}>
            <div className="flex items-center gap-2">
              <CheckCircleFilled style={{ color: token.colorSuccessTextActive }} />
              <Typography.Text type="secondary">{__('Ready to use')}</Typography.Text>
            </div>
          </If>

          <If conditions={!isPluginInfoError && !isActive && canInstallPlugins}>
            <Button
              className="rounded-full"
              loading={isInstalling}
              onClick={handleInstall}
              type="primary"
            >
              {isInstalled ? __('Activate') : __('Install and Activate')}
            </Button>
          </If>

          <If conditions={!isPluginInfoError && !isActive && !canInstallPlugins}>
            <Tooltip
              title={__(
                'You do not have permission to install or activate plugins. Please contact the administrator.'
              )}
            >
              <Typography.Text className="flex items-center gap-2" type="secondary">
                <InfoCircleOutlined />
                {__('Administrator permission required')}
              </Typography.Text>
            </Tooltip>
          </If>
        </div>
      </If>
    </Card>
  )
}
