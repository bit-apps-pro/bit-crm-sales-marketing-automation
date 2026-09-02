import { __ } from '@common/helpers/i18nWrap'
import PluginActivationGuard from '@features/plugin-activation-guard'
import SettingsPageHeader from '@utilities/settings-page-header'

import BitFormIntegrationPanel from './ui/bit-form-integration-panel'

export default function BitFormSettings() {
  return (
    <div>
      <SettingsPageHeader title={__('Bit Form Settings')} />

      <div className="mx-6 my-2">
        <PluginActivationGuard slug="bit-form">
          {() => <BitFormIntegrationPanel />}
        </PluginActivationGuard>
      </div>
    </div>
  )
}
