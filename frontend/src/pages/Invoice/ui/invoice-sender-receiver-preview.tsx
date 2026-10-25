import { renderFullAddress, renderFullName } from '@common/helpers/entity-helpers'
import { __ } from '@common/helpers/i18nWrap'
import useCountries from '@common/hooks/use-countries'
import useStates from '@common/hooks/use-states'
import { type BusinessSettings } from '@pages/general-settings/internal/business-settings/shared/types'
import {
  type ContactInformation,
  type DealInformation
} from '@pages/invoice-create/shared/invoice-create-types'
import { Typography } from 'antd'

interface InvoiceSenderReceiverPreviewProps {
  businessSettings?: BusinessSettings
  contact?: ContactInformation
  deal?: DealInformation
}

export default function InvoiceSenderReceiverPreview({
  businessSettings,
  contact,
  deal
}: InvoiceSenderReceiverPreviewProps) {
  const { getCountryLabel } = useCountries()
  const { getStateLabel } = useStates(contact?.billing_country)

  return (
    <div className="grid grid-cols-2 gap-20 rounded-lg p-1">
      <div>
        <Typography.Title level={5}>{__('From')}</Typography.Title>
        {businessSettings?.name && (
          <Typography.Text className="block" strong>
            {businessSettings.name}
          </Typography.Text>
        )}
        {businessSettings?.phone_number && (
          <Typography.Text className="block text-sm" type="secondary">
            <span dir="ltr">{businessSettings.phone_number}</span>
          </Typography.Text>
        )}
        {businessSettings?.mobile_number && (
          <Typography.Text className="block text-sm" type="secondary">
            <span dir="ltr">{businessSettings.mobile_number}</span>
          </Typography.Text>
        )}
        {businessSettings?.email && (
          <Typography.Text className="block text-sm" type="secondary">
            {businessSettings.email}
          </Typography.Text>
        )}
        {businessSettings?.street && (
          <Typography.Text className="block text-sm" type="secondary">
            {businessSettings.street}
          </Typography.Text>
        )}
        {(businessSettings?.city || businessSettings?.state || businessSettings?.postal_code) && (
          <Typography.Text className="block text-sm" type="secondary">
            {[businessSettings?.city, businessSettings?.state, businessSettings?.postal_code]
              .filter(Boolean)
              .join(', ')}
          </Typography.Text>
        )}
        {businessSettings?.country && (
          <Typography.Text className="block text-sm" type="secondary">
            {businessSettings.country}
          </Typography.Text>
        )}
        {businessSettings?.tax_id && (
          <Typography.Text className="block text-sm" type="secondary">
            {__('Tax ID')}: {businessSettings.tax_id}
          </Typography.Text>
        )}
      </div>
      <div>
        <Typography.Title level={5}>{__('Bill To')}</Typography.Title>
        <Typography.Text className="block" strong>
          {renderFullName(contact?.title, contact?.first_name, contact?.last_name)}
        </Typography.Text>
        <Typography.Text className="block text-sm" type="secondary">
          {deal?.email}
        </Typography.Text>
        <Typography.Text className="block text-sm" type="secondary">
          {renderFullAddress(
            contact?.billing_address_line_1,
            contact?.billing_address_line_2,
            contact?.billing_city,
            contact?.billing_county,
            getStateLabel(contact?.billing_country, contact?.billing_state),
            contact?.billing_zip,
            getCountryLabel(contact?.billing_country)
          )}
        </Typography.Text>
        {contact?.tax_id && (
          <Typography.Text className="block text-sm" type="secondary">
            {__('Tax ID')}: {contact.tax_id}
          </Typography.Text>
        )}
      </div>
    </div>
  )
}
