import { __ } from '@common/helpers/i18nWrap'
import { Tabs, Typography } from 'antd'
import { useSearchParams } from 'react-router'

import WoocommerceIntegration from './internal/woocommerce/woocommerce-integration'

export default function IntegrationSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'woo-integration'

  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
        <Typography.Title className="mb-0" level={2}>
          {__('Integration Settings')}
        </Typography.Title>
      </div>
      <Tabs
        activeKey={defaultActiveTab}
        className="mx-6 my-2"
        items={[
          {
            children: <WoocommerceIntegration />,
            key: 'woo-integration',
            label: __('WooCommerce')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
