import { __ } from '@common/helpers/i18nWrap'
import { Button, Result, Skeleton, Typography } from 'antd'
import { type ReactNode } from 'react'

import useInstallPlugin from './data/use-install-plugin'
import usePluginInfo from './data/use-plugin-info'
import { PLUGIN_GUARD_CONTENT, type PluginSlug } from './shared/constants'
import { type PluginInfo } from './shared/types'

interface PluginActivationGuardProps {
  children: (data: PluginInfo) => ReactNode
  slug: PluginSlug
}

export default function PluginActivationGuard({ children, slug }: PluginActivationGuardProps) {
  const { data, isPluginInfoPending } = usePluginInfo(slug)
  const { installPlugin, isInstalling } = useInstallPlugin(slug)

  const handleInstall = async () => {
    try {
      await installPlugin(slug)
    } catch {
      // Error is handled in the hook
    }
  }

  if (isPluginInfoPending) {
    return <Skeleton active />
  }

  if (data?.isActive) {
    return children(data)
  }

  const isInstalled = data?.isInstalled ?? false
  const { notActivated, notInstalled } = PLUGIN_GUARD_CONTENT[slug]
  const content = isInstalled ? notActivated : notInstalled

  return (
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
            {content.buttonLabel}
          </Button>
        ) : (
          <Typography.Text mark strong type="danger">
            {__(
              'You do not have permission to install plugins. Please contact the administrator to install the plugin.'
            )}
          </Typography.Text>
        )
      }
      status={isInstalled ? 'warning' : 'error'}
      subTitle={content.subTitle}
      title={content.title}
    />
  )
}
