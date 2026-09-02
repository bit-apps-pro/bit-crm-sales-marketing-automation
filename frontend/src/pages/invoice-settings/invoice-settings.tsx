import { __ } from '@common/helpers/i18nWrap'
import SettingsPageHeader from '@utilities/settings-page-header'
import SettingsTabs from '@utilities/settings-tabs'
import { useSearchParams } from 'react-router'

import Payments from './internal/payments'
import Prefix from './internal/prefix/prefix'
import Terms from './internal/terms/terms'

export default function InvoiceSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'prefix-settings'
  return (
    <div>
      <SettingsPageHeader title={__('Invoice Settings')} />
      <SettingsTabs
        activeKey={defaultActiveTab}
        items={[
          {
            children: <Prefix />,
            key: 'prefix-settings',
            label: __('Prefix Settings')
          },
          {
            children: <Terms />,
            key: 'configure-payment-terms',
            label: __('Configure Payment Terms')
          },
          {
            children: <Payments />,
            key: 'payments',
            label: __('Payments')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
