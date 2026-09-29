import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import FieldSettings from '@features/field-settings'
import SettingsPageHeader from '@utilities/settings-page-header'
import SettingsTabs from '@utilities/settings-tabs'
import { LuArchive, LuKanban, LuTextCursorInput } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import ArchivedStages from './ui/archived-stages'
import Stages from './ui/stages'

export default function DealSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'field-settings'

  return (
    <div>
      <SettingsPageHeader title={__('Deal Settings')} />
      <SettingsTabs
        activeKey={defaultActiveTab}
        animated
        items={[
          {
            children: <FieldSettings module={MODULES.DEAL} />,
            icon: <LuTextCursorInput />,
            key: 'field-settings',
            label: __('Field Settings')
          },
          {
            children: <Stages />,
            icon: <LuKanban />,
            key: 'stages',
            label: __('Stage Settings')
          },
          {
            children: <ArchivedStages />,
            icon: <LuArchive />,
            key: 'archived-stages',
            label: __('Archived Stages')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
