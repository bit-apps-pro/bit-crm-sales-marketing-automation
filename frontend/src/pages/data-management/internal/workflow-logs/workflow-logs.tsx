import { __ } from '@common/helpers/i18nWrap'
import { ProWorkflowLogsAlert } from '@utilities/pro-feature-alert'

export default function WorkflowLogs() {
  return <ProWorkflowLogsAlert featureName={__('Workflow Logs')} />
}
