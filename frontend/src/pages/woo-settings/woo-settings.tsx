import { __ } from '@common/helpers/i18nWrap'
import SettingsPageHeader from '@utilities/settings-page-header'

import WoocommerceProductIntegration from './internal/woocommerce-product-integration'
import WoocommerceSyncSettings from './internal/woocommerce-sync-settings'

const WOOCOMMERCE_SETTING_KEY = 'woocommerce_integration_settings'

export default function WooSettings() {
  return (
    <div>
      <SettingsPageHeader title={__('WooCommerce Settings')} />

      <div className="mx-6 my-2 space-y-4">
        <WoocommerceProductIntegration />
        <WoocommerceSyncSettings settingKey={WOOCOMMERCE_SETTING_KEY} />
      </div>
    </div>
  )
}
