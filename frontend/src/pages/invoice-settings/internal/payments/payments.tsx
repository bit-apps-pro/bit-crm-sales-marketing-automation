import { __ } from '@common/helpers/i18nWrap'
import { ProInvoicePaymentsAlert } from '@utilities/pro-feature-alert'

/**
 * Free variant — collecting invoice payments through WooCommerce is a pro
 * feature; the tab shows a locked preview of the provider settings.
 */
export default function Payments() {
  return <ProInvoicePaymentsAlert featureName={__('Invoice Payments')} />
}
