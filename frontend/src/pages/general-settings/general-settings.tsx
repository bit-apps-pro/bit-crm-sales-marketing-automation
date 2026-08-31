import { __ } from '@common/helpers/i18nWrap'
import SettingsPageHeader from '@utilities/settings-page-header'

import BusinessSettings from './internal/business-settings'

export default function GeneralSettings() {
  return (
    <div>
      <SettingsPageHeader title={__('General Settings')} />
      <div className="mx-6 my-2">
        <BusinessSettings />
      </div>
    </div>
  )
}
