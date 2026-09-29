export interface SureCartIntegrationSettingsType {
  enable_surecart_products?: boolean
  is_surecart_plugin_active?: boolean
}

export type SureCartIntegrationSettingsResponse = SureCartIntegrationSettingsType

/** Return shape of the free useSureCartProductIntegration hook. */
export interface SureCartProductIntegration {
  integrations: SureCartIntegrationSettingsResponse | undefined
  isIntegrationsLoading: boolean
  isSureCartEnabled: boolean
}
