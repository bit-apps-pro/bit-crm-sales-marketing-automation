import { __ } from '@common/helpers/i18nWrap'
import { type BusinessSettings } from '@pages/general-settings/internal/business-settings/shared/types'
import If from '@utilities/If'
import { Button, Typography } from 'antd'
import { LuPlus } from 'react-icons/lu'
import { Link } from 'react-router'

interface BusinessInformationProps {
  businessSettings?: BusinessSettings
}

export default function BusinessInformation({ businessSettings }: BusinessInformationProps) {
  return (
    <div className="flex h-full flex-col space-y-4 rounded-md border border-solid border-[#EBEAFF] p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex h-10 items-center justify-between">
        <Typography.Text strong>{__('From')}</Typography.Text>
      </div>
      {businessSettings?.name ? (
        <div className="flex-1 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:bg-neutral-900">
          <div className="space-y-1">
            <If conditions={businessSettings.name}>
              <Typography.Text className="block" strong>
                {businessSettings.name}
              </Typography.Text>
            </If>

            <If conditions={businessSettings.phone_number}>
              <Typography.Text className="block text-sm" type="secondary">
                {businessSettings.phone_number}
              </Typography.Text>
            </If>
            <If conditions={businessSettings.mobile_number}>
              <Typography.Text className="block text-sm" type="secondary">
                {businessSettings.mobile_number}
              </Typography.Text>
            </If>
            <If conditions={businessSettings.email}>
              <Typography.Text className="block text-sm" type="secondary">
                {businessSettings.email}
              </Typography.Text>
            </If>
            <If conditions={businessSettings.street}>
              <Typography.Text className="block text-sm" type="secondary">
                {businessSettings.street}
              </Typography.Text>
            </If>
            <If
              conditions={
                businessSettings.city || businessSettings.state || businessSettings.postal_code
              }
            >
              <Typography.Text className="block text-sm" type="secondary">
                {[businessSettings.city, businessSettings.state, businessSettings.postal_code]
                  .filter(Boolean)
                  .join(', ')}
              </Typography.Text>
            </If>
            <If conditions={businessSettings.country}>
              <Typography.Text className="block text-sm" type="secondary">
                {businessSettings.country}
              </Typography.Text>
            </If>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <Link target="_blank" to="/settings/general-settings">
            <Button
              className="h-full w-full py-12 dark:bg-neutral-900"
              icon={<LuPlus size={16} />}
              size="large"
              type="dashed"
            >
              {__('Add Business Settings')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
