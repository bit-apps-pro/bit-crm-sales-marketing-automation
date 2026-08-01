import { __ } from '@common/helpers/i18nWrap'
import { Tabs, Typography } from 'antd'
import { useSearchParams } from 'react-router'

import Payments from './internal/payments'
import Prefix from './internal/prefix/prefix'
import Terms from './internal/terms/terms'

export default function InvoiceSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'prefix-settings'
  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
        <Typography.Title className="mb-0" level={2}>
          {__('Invoice Settings')}
        </Typography.Title>
      </div>
      <Tabs
        activeKey={defaultActiveTab}
        className="mx-6 my-2"
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
