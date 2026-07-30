import { __ } from '@common/helpers/i18nWrap'
import PluginActivationGuard from '@features/plugin-activation-guard'
import { Typography } from 'antd'

import BitFormIntegrationPanel from './ui/bit-form-integration-panel'

export default function BitFormSettings() {
  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
        <Typography.Title className="mb-0" level={2}>
          {__('Bit Form Settings')}
        </Typography.Title>
      </div>

      <div className="mx-6 my-2">
        <PluginActivationGuard slug="bit-form">
          {() => <BitFormIntegrationPanel />}
        </PluginActivationGuard>
      </div>
    </div>
  )
}
