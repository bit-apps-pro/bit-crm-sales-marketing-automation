import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import FieldSettings from '@features/field-settings'
import SettingsPageHeader from '@utilities/settings-page-header'
import SettingsTabs from '@utilities/settings-tabs'
import { useSearchParams } from 'react-router'

import ConversionMapping from './internal/conversion-mapping'

export default function LeadSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'field-settings'

  return (
    <div>
      <SettingsPageHeader title={__('Lead Settings')} />
      <SettingsTabs
        activeKey={defaultActiveTab}
        destroyOnHidden
        items={[
          {
            children: <FieldSettings module={MODULES.LEAD} />,
            key: 'field-settings',
            label: __('Field Settings')
          },
          {
            children: <ConversionMapping />,
            key: 'conversion-mapping',
            label: __('Conversion Mapping')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
