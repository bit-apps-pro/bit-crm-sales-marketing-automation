import { __ } from '@common/helpers/i18nWrap'
import { ProAiSettingsAlert } from '@utilities/pro-feature-alert'

export default function AiSettings() {
  return <ProAiSettingsAlert featureName={__('AI Assistant')} />
}
