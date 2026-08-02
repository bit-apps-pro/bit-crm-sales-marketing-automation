import { __ } from '@common/helpers/i18nWrap'
import { Switch, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'
import TableMock from './table-mock'

const { Text } = Typography

export default function ProMcpSettingsAlert({ featureName }: ProFeatureAlertProps) {
  const CLIENT_COLUMNS = [__('Client'), __('User'), __('Last Used'), __('Actions')]

  return (
    <LockedOverlay featureName={featureName}>
      <div>
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
          <Typography.Title className="mb-0" level={2}>
            {__('MCP Server')}
          </Typography.Title>
        </div>

        <div className="flex items-center justify-between gap-6 border-0 border-b border-solid border-[#E5E3FE] px-6 py-4 dark:border-neutral-700">
          <div className="flex-1">
            <Text className="block font-medium">{__('Enable MCP Server')}</Text>
            <Text className="block text-sm" type="secondary">
              {__(
                'Let AI clients like Claude and ChatGPT work with your CRM data. Each connection is limited to the permissions of the user who approved it.'
              )}
            </Text>
          </div>
          <div className="shrink-0">
            <Switch checked />
          </div>
        </div>

        <div className="px-6 py-4">
          <Text className="mb-3 block text-base" strong>
            {__('Connected Clients')}
          </Text>
          <TableMock columns={CLIENT_COLUMNS} />
        </div>
      </div>
    </LockedOverlay>
  )
}
