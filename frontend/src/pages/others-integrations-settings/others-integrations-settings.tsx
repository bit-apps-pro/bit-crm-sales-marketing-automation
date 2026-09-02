import { __ } from '@common/helpers/i18nWrap'
import SettingsPageHeader from '@utilities/settings-page-header'
import { Typography } from 'antd'

import { PLUGIN_CARDS } from './shared/constants'
import PluginIntegrationCard from './ui/plugin-integration-card'

export default function OthersIntegrationsSettings() {
  return (
    <div>
      <SettingsPageHeader title={__('Other Integrations Settings')} />

      <div className="mx-6 my-4">
        <Typography.Paragraph type="secondary">
          {__(
            'Extend Bit CRM with these companion plugins. Install and activate a plugin to unlock its integration.'
          )}
        </Typography.Paragraph>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PLUGIN_CARDS.map(plugin => (
            <PluginIntegrationCard
              description={plugin.description}
              key={plugin.slug}
              logo={plugin.logo}
              slug={plugin.slug}
              title={plugin.title}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
