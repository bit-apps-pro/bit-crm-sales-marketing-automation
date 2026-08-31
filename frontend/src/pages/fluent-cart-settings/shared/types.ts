export interface FluentCartIntegrationSettingsType {
  enable_fluent_cart_products?: boolean
  is_fluent_cart_plugin_active?: boolean
}

export type FluentCartIntegrationSettingsResponse = FluentCartIntegrationSettingsType

/** Return shape of the free useFluentCartProductIntegration hook. */
export interface FluentCartProductIntegration {
  integrations: FluentCartIntegrationSettingsResponse | undefined
  isFluentCartEnabled: boolean
  isIntegrationsLoading: boolean
}
