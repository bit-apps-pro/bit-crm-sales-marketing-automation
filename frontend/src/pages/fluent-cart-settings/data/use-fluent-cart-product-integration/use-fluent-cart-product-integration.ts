import { type FluentCartProductIntegration } from '../../shared/types'

/**
 * Free build stand-in for the pro hook.
 *
 * The FluentCart source is a pro feature, so the route it would read
 * (settings/integration/fluent-cart-product) is not registered here - asking for
 * it would only produce a 404 on every deal and invoice editor load. Kept with
 * the pro hook's exact shape so the shared line-item components can call it
 * unconditionally.
 */
export default function useFluentCartProductIntegration(): FluentCartProductIntegration {
  return {
    integrations: undefined,
    isFluentCartEnabled: false,
    isIntegrationsLoading: false
  }
}
