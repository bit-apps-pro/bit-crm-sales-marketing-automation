import { __ } from '@common/helpers/i18nWrap'
import { ProActivityLogsAlert } from '@utilities/pro-feature-alert'

export default function ActivityLogs() {
  return <ProActivityLogsAlert featureName={__('Activity Logs')} />
}
