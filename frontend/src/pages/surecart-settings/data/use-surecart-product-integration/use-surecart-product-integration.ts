import { type SureCartProductIntegration } from '../../shared/types'

/**
 * Free build stand-in for the pro hook.
 *
 * The SureCart source is a pro feature, so the route it would read
 * (settings/integration/surecart-product) is not registered here — asking for
 * it would only produce a 404 on every deal and invoice editor load. Kept with
 * the pro hook's exact shape so the shared line-item components can call it
 * unconditionally.
 */
export default function useSureCartProductIntegration(): SureCartProductIntegration {
  return {
    integrations: undefined,
    isIntegrationsLoading: false,
    isSureCartEnabled: false
  }
}
