import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import FieldSettings from '@features/field-settings'
import SettingsPageHeader from '@utilities/settings-page-header'
import SettingsTabs from '@utilities/settings-tabs'
import { LuTextCursorInput } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

export default function CompanySettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'field-settings'

  return (
    <div>
      <SettingsPageHeader title={__('Company Settings')} />
      <SettingsTabs
        defaultActiveKey={defaultActiveTab}
        items={[
          {
            children: <FieldSettings module={MODULES.COMPANY} />,
            icon: <LuTextCursorInput />,
            key: 'field-settings',
            label: __('Field Settings')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
