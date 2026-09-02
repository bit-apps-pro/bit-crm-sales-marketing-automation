import { __ } from '@common/helpers/i18nWrap'
import PluginActivationGuard from '@features/plugin-activation-guard'
import SettingsPageHeader from '@utilities/settings-page-header'

import SmtpDescription from './ui/smtp-description'

export default function SmtpSettings() {
  return (
    <div>
      <SettingsPageHeader title={__('SMTP Settings')} />

      <div className="mx-6 my-2">
        <PluginActivationGuard slug="bit-smtp">
          {data => <SmtpDescription data={data} />}
        </PluginActivationGuard>
      </div>
    </div>
  )
}
