import { __ } from '@common/helpers/i18nWrap'
import { ProPortalSettingsAlert } from '@utilities/pro-feature-alert'

export default function PortalSettings() {
  return <ProPortalSettingsAlert featureName={__('Portal Settings')} />
}
