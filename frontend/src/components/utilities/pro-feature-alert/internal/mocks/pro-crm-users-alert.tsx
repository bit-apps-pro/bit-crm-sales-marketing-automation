import { __ } from '@common/helpers/i18nWrap'
import { Button, Typography } from 'antd'
import { LuPlus } from 'react-icons/lu'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'
import TableMock from './table-mock'

export default function ProCrmUsersAlert({ featureName }: ProFeatureAlertProps) {
  const COLUMNS = [__('Name'), __('Email'), __('Capabilities'), __('Actions')]

  return (
    <LockedOverlay featureName={featureName}>
      <div>
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
          <Typography.Title className="mb-0" level={2}>
            {__('CRM Users')}
          </Typography.Title>
        </div>

        <div className="px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <Typography.Text className="text-base" strong>
                {__('Assign and manage plugin capabilities for existing WordPress users.')}
              </Typography.Text>
              <Typography.Text type="secondary">
                {__('Users with the Administrator role have full access to the plugin by default.')}
              </Typography.Text>
            </div>
            <Button className="rounded-full" icon={<LuPlus />} size="large" type="primary">
              {__('Add User')}
            </Button>
          </div>
          <TableMock columns={COLUMNS} />
        </div>
      </div>
    </LockedOverlay>
  )
}
