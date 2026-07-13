import { __ } from '@common/helpers/i18nWrap'
import { DatePicker, Input, Select, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'
import TableMock from './table-mock'

const { RangePicker } = DatePicker

export default function ProHistoryAlert({ featureName }: ProFeatureAlertProps) {
  const COLUMNS = [__('Date'), __('Event'), __('Title'), __('Module'), __('User'), __('Details')]

  return (
    <LockedOverlay featureName={featureName}>
      <div className="px-6 py-4">
        <Typography.Title className="mb-0" level={3}>
          {__('History')}
        </Typography.Title>
        <div className="mt-4 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-end gap-2 p-3">
            <Select
              allowClear
              className="w-48 [&_.ant-select-selector]:rounded-full"
              placeholder={__('Filter by module')}
            />
            <RangePicker
              allowClear
              className="w-64 rounded-full"
              placeholder={[__('Start Date'), __('End Date')]}
            />
            <Input className="w-52 rounded-full" placeholder={__('Search history...')} />
          </div>
          <TableMock columns={COLUMNS} />
        </div>
      </div>
    </LockedOverlay>
  )
}
