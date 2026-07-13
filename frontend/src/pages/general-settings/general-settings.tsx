import { __ } from '@common/helpers/i18nWrap'
import { Typography } from 'antd'

import BusinessSettings from './internal/business-settings'

export default function GeneralSettings() {
  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
        <Typography.Title className="mb-0" level={2}>
          {__('General Settings')}
        </Typography.Title>
      </div>
      <div className="mx-6 my-2">
        <BusinessSettings />
      </div>
    </div>
  )
}
