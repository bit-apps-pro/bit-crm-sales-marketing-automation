import WoocommerceProductIntegration from './woocommerce-product-integration'
import WoocommerceSyncSettings from './woocommerce-sync-settings'

const WOOCOMMERCE_SETTING_KEY = 'woocommerce_integration_settings'

export default function WoocommerceIntegration() {
  return (
    <div className="space-y-4">
      <WoocommerceProductIntegration />
      <WoocommerceSyncSettings settingKey={WOOCOMMERCE_SETTING_KEY} />
    </div>
  )
}
