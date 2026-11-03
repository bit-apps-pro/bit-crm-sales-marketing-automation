import { __ } from '@common/helpers/i18nWrap'
import SettingsPageHeader from '@utilities/settings-page-header'
import SettingsTabs from '@utilities/settings-tabs'
import { LuCalendarClock, LuCreditCard, LuHash, LuNotebookPen } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import Defaults from './internal/defaults/defaults'
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
            icon: <LuHash />,
            key: 'prefix-settings',
            label: __('Prefix Settings')
          },
          {
            children: <Terms />,
            icon: <LuCalendarClock />,
            key: 'configure-payment-terms',
            label: __('Configure Payment Terms')
          },
          {
            children: <Defaults />,
            icon: <LuNotebookPen />,
            key: 'defaults',
            label: __('Default Notes')
          },
          {
            children: <Payments />,
            icon: <LuCreditCard />,
            key: 'payments',
            label: __('Payments')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
