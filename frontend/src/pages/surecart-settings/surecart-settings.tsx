import { __ } from '@common/helpers/i18nWrap'
import { ProSureCartSettingsAlert } from '@utilities/pro-feature-alert'

export default function SureCartSettings() {
  return <ProSureCartSettingsAlert featureName={__('SureCart Settings')} />
}
