import { __ } from '@common/helpers/i18nWrap'
import { ProBanner } from '@utilities/pro-feature-alert'

/**
 * Free variant — collecting invoice payments (WooCommerce checkout, share
 * links, partial payments) is a pro feature, so the sidebar shows a single
 * upgrade prompt in place of the payment panels.
 */
export default function getInvoicePaymentPanels() {
  return [
    {
      children: (
        <ProBanner className="px-2 py-4" featureName={__('Invoice Payments')} showIcon={false} />
      ),
      key: 'payments',
      label: <span className="text-slate-500">{__('Payment History')}</span>
    }
  ]
}
