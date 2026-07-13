import { renderFullAddress, renderFullName } from '@common/helpers/entity-helpers'
import { __ } from '@common/helpers/i18nWrap'
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
            {businessSettings.phone_number}
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
      </div>
      <div>
        <Typography.Title level={5}>{__('Bill To')}</Typography.Title>
        <Typography.Text strong>
          {renderFullName(contact?.title, contact?.first_name, contact?.last_name)}
        </Typography.Text>
        <Typography.Text className="block text-sm">{deal?.email}</Typography.Text>
        <Typography.Text className="block text-sm">
          {renderFullAddress(
            contact?.billing_address_line_1,
            contact?.billing_address_line_2,
            contact?.billing_city,
            contact?.billing_county,
            contact?.billing_state,
            contact?.billing_zip,
            contact?.billing_country
          )}
        </Typography.Text>
      </div>
    </div>
  )
}
