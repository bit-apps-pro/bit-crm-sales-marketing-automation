import { __ } from '@common/helpers/i18nWrap'
import { Typography } from 'antd'

import WoocommerceProductIntegration from './internal/woocommerce-product-integration'
import WoocommerceSyncSettings from './internal/woocommerce-sync-settings'

const WOOCOMMERCE_SETTING_KEY = 'woocommerce_integration_settings'

export default function WooSettings() {
  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
        <Typography.Title className="mb-0" level={2}>
          {__('WooCommerce Settings')}
        </Typography.Title>
      </div>

      <div className="mx-6 my-2 space-y-4">
        <WoocommerceProductIntegration />
        <WoocommerceSyncSettings settingKey={WOOCOMMERCE_SETTING_KEY} />
      </div>
    </div>
  )
}
