import { __ } from '@common/helpers/i18nWrap'
import { Switch, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'

const { Text, Title } = Typography

/**
 * Static mock of the "Accept invoice payments via WooCommerce" settings card
 * shown behind the pro upgrade banner on the invoice settings Payments tab.
 */
export default function ProInvoicePaymentsAlert({ featureName }: ProFeatureAlertProps) {
  return (
    <LockedOverlay className="min-h-[40vh]" featureName={featureName}>
      <div className="rounded-md border border-solid border-[#E5E3FE] dark:border-neutral-700">
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-6 py-3 dark:border-neutral-700">
          <Title className="mb-0" level={5}>
            {__('Invoice Payments')}
          </Title>
        </div>
        <div className="flex items-center justify-between gap-6 px-6 py-4">
          <div className="flex-1">
            <Text className="block font-medium">
              {__('Accept invoice payments via WooCommerce')}
            </Text>
            <Text className="block text-sm" type="secondary">
              {__(
                'Let customers pay invoices through the WooCommerce checkout using your store payment gateways.'
              )}
            </Text>
          </div>
          <div className="shrink-0">
            <Switch checked disabled />
          </div>
        </div>
      </div>
    </LockedOverlay>
  )
}
