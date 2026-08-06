import { type Response } from '@common/helpers/request'
import queryRequest from '@common/helpers/request'
import { useQuery } from '@tanstack/react-query'

import { type IntegrationSettingsResponse } from '../shared/types'

export default function useWooProductIntegration() {
  const { data, isLoading } = useQuery<
    Response<IntegrationSettingsResponse>,
    Error,
    IntegrationSettingsResponse
  >({
    queryFn: ({ signal }) =>
      queryRequest('settings/integration/woo-product', undefined, undefined, 'GET', { signal }),
    queryKey: ['integration', 'woo-product'],
    select: res => res.data
  })

  return {
    integrations: data,
    isIntegrationsLoading: isLoading,
    isWooEnabled: data?.enable_woo_products && data?.is_woo_plugin_active
  }
}
