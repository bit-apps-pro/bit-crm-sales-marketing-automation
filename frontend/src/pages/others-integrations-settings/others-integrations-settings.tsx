import { __ } from '@common/helpers/i18nWrap'
import { Typography } from 'antd'

import { PLUGIN_CARDS } from './shared/constants'
import PluginIntegrationCard from './ui/plugin-integration-card'

export default function OthersIntegrationsSettings() {
  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
        <Typography.Title className="mb-0" level={2}>
          {__('Other Integrations Settings')}
        </Typography.Title>
      </div>

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
