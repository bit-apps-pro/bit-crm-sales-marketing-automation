import { __ } from '@common/helpers/i18nWrap'
import { ProFluentCartSettingsAlert } from '@utilities/pro-feature-alert'

export default function FluentCartSettings() {
  return <ProFluentCartSettingsAlert featureName={__('FluentCart Settings')} />
}
