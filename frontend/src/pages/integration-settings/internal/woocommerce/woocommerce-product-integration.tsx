import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import useUpdateWooProductIntegration from '@pages/integration-settings/data/use-update-woo-product-integration'
import useWooProductIntegration from '@pages/integration-settings/data/use-woo-product-integration'
import { Skeleton, Switch, Typography } from 'antd'

const { Text, Title } = Typography

export default function WoocommerceProductIntegration() {
  const { integrations, isIntegrationsPending } = useWooProductIntegration()
  const { isUpdating, updateSettings } = useUpdateWooProductIntegration()

  const isWooPluginActive = integrations?.is_woo_plugin_active ?? false
  const enableWooProducts = integrations?.enable_woo_products ?? false

  const handleToggleChange = async (checked: boolean) => {
    await updateSettings({
      setting_key: 'integration_settings',
      setting_value: { enable_woo_products: checked }
    })
  }

  if (isIntegrationsPending) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    )
  }

  return (
    <div className="rounded-md border border-solid border-[#E5E3FE] dark:border-[#3F3A86]">
      <div className="flex items-center border-0 border-b border-solid border-[#E5E3FE] px-6 py-3 dark:border-[#3F3A86]">
        <Title className="mb-0" level={5}>
          {__('WooCommerce Product Integration')}
        </Title>
      </div>
      <div
        className={cn(
          'flex items-center justify-between gap-6 border-0 border-b border-solid border-[#E5E3FE] px-6 py-4 last:border-b-0 dark:border-[#3F3A86]',
          !isWooPluginActive && 'opacity-50'
        )}
      >
        <div className="flex-1">
          <Text className="block font-medium">{__('Enable WooCommerce Products')}</Text>
          <Text className="block text-sm" type="secondary">
            {__(
              'Allow selecting WooCommerce products in deals and other modules. Product source selection will be available when this is enabled.'
            )}
          </Text>
        </div>
        <div className="shrink-0">
          <Switch
            checked={enableWooProducts}
            disabled={!isWooPluginActive || isUpdating}
            loading={isUpdating}
            onChange={handleToggleChange}
          />
        </div>
      </div>
    </div>
  )
}
