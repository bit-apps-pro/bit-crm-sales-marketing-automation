import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import SettingsPageHeader from '@utilities/settings-page-header'
import SettingsTabs from '@utilities/settings-tabs'
import { useSearchParams } from 'react-router'

import ActivityLogs from './internal/activity-logs'
import Exports from './internal/exports'
import Imports from './internal/imports'
import RecycleBin from './internal/recycle-bin'
import WorkflowLogs from './internal/workflow-logs'

const tabs = [
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    children: <RecycleBin />,
    key: 'recycle-bin',
    label: __('Recycle Bin')
  },
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    children: <Imports />,
    key: 'imports',
    label: __('Imports')
  },
  {
    capability: CAPABILITIES.SETTING.DATA_MANAGEMENT,
    children: <Exports />,
    key: 'exports',
    label: __('Exports')
  },
  {
    capability: CAPABILITIES.SETTING.HISTORY,
    children: <ActivityLogs />,
    key: 'activity-logs',
    label: __('History Logs')
  },
  {
    capability: CAPABILITIES.SETTING.WORKFLOW,
    children: <WorkflowLogs />,
    key: 'workflow',
    label: __('Workflow Logs')
  }
]

export default function DataManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'recycle-bin'

  const items = tabs.filter(tab => tab.capability && checkCapability(tab.capability))

  return (
    <div>
      <SettingsPageHeader title={__('Data Management')} />
      <SettingsTabs
        activeKey={defaultActiveTab}
        destroyOnHidden
        items={items}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
