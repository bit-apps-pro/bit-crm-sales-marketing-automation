import { __ } from '@common/helpers/i18nWrap'
import { Switch, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'

const { Text } = Typography

export default function ProFluentCartSettingsAlert({ featureName }: ProFeatureAlertProps) {
  return (
    <LockedOverlay featureName={featureName}>
      <div>
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
          <Typography.Title className="mb-0" level={2}>
            {__('FluentCart Settings')}
          </Typography.Title>
        </div>

        <div className="mx-6 my-2">
          <div className="rounded-md border border-solid border-[#E5E3FE] dark:border-neutral-700">
            <div className="flex items-center border-0 border-b border-solid border-[#E5E3FE] px-6 py-3 dark:border-neutral-700">
              <Typography.Title className="mb-0" level={5}>
                {__('FluentCart Product Integration')}
              </Typography.Title>
            </div>
            <div className="flex items-center justify-between gap-6 px-6 py-4">
              <div className="flex-1">
                <Text className="block font-medium">{__('Enable FluentCart Products')}</Text>
                <Text className="block text-sm" type="secondary">
                  {__(
                    'Allow selecting FluentCart products in deal and invoice line items. Product source selection will be available when this is enabled.'
                  )}
                </Text>
              </div>
              <div className="shrink-0">
                <Switch checked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LockedOverlay>
  )
}
