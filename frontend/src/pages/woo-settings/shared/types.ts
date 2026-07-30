export interface IntegrationSettingsType {
  enable_woo_products?: boolean
  is_woo_plugin_active?: boolean
}

export type IntegrationSettingsResponse = IntegrationSettingsType

export interface UpdateIntegrationSettingsPayload {
  setting_key: string
  setting_value: Omit<IntegrationSettingsType, 'is_woo_plugin_active'>
}

export interface WooCommerceIntegrationSettings {
  coupon_tag_prefix: string
  include_coupon_as_tag: boolean
  product_tag_prefix: string
  sync_enabled: boolean
  tag_contact: boolean
  use_coupon_tag_prefix: boolean
  use_product_tag_prefix: boolean
}

export interface WcSyncSettingsResponse {
  is_woo_plugin_active: boolean
  setting_value: undefined | WooCommerceIntegrationSettings
}
