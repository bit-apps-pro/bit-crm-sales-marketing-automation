import { __ } from '@common/helpers/i18nWrap'
import { ProEntitiesAlert } from '@utilities/pro-feature-alert'

export default function Workflows() {
  const WORKFLOW_COLUMNS = [
    __('Name'),
    __('Flows'),
    __('Module'),
    __('Trigger'),
    __('Created At'),
    __('Status'),
    __('Actions')
  ]

  return <ProEntitiesAlert columns={WORKFLOW_COLUMNS} featureName="Workflows" />
}
