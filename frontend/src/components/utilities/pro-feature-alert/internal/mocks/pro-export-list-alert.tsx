import { __ } from '@common/helpers/i18nWrap'
import { Select, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'
import TableMock from './table-mock'

export default function ProExportListAlert({ featureName }: ProFeatureAlertProps) {
  const COLUMNS = [__('File'), __('Module'), __('Date'), __('Count'), __('Progress'), __('Actions')]

  return (
    <LockedOverlay featureName={featureName}>
      <div className="p-4">
        <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-2 p-2">
            <Typography.Title className="mb-0" level={4}>
              {__('Exports history')}
            </Typography.Title>
            <Select
              allowClear
              className="w-36 [&_.ant-select-selector]:rounded-full"
              placeholder={__('Filter by module')}
            />
          </div>
          <TableMock columns={COLUMNS} />
        </div>
      </div>
    </LockedOverlay>
  )
}
