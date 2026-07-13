import { __ } from '@common/helpers/i18nWrap'
import FilterButton from '@utilities/filter-button'
import { Button, Input, Space, Typography } from 'antd'
import { LuChevronDown, LuColumns2, LuFileDown, LuPlus, LuUpload } from 'react-icons/lu'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'
import TableMock from './table-mock'

interface ProEntitiesAlertProps extends ProFeatureAlertProps {
  columns: string[]
}

export default function ProEntitiesAlert({ columns, featureName }: ProEntitiesAlertProps) {
  return (
    <LockedOverlay featureName={featureName}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography.Title className="mb-0" level={3}>
              {featureName}
            </Typography.Title>
            <Button className="rounded-full px-5" icon={<LuPlus />} size="large" type="primary">
              {__('New')}
            </Button>
          </div>
          <Space.Compact direction="horizontal" size="large">
            <Button
              className="rounded-l-full text-sm text-gray-500 dark:text-gray-400"
              icon={<LuFileDown size={14} />}
            >
              {__('Import')}
            </Button>
            <Button
              className="rounded-r-full text-sm text-gray-500 dark:text-gray-400"
              icon={<LuUpload size={14} />}
            >
              {__('Export')}
            </Button>
          </Space.Compact>
        </div>
        <div className="mt-4 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-4 p-3">
            <Button
              className="rounded-full text-sm text-gray-500 dark:text-gray-400"
              icon={<LuColumns2 />}
              size="large"
            >
              {__('Columns')}
            </Button>
            <div className="flex items-center gap-2">
              <FilterButton activeFilterCount={0} title={__('Advanced Filters')} />
              <div className="flex h-10 items-center gap-1 rounded-full border border-solid border-[#E5E3FE] bg-white px-4 dark:border-[#3F3A86] dark:bg-transparent">
                <Typography.Text>{__('Filter by Tag')}</Typography.Text>
                <LuChevronDown size={14} />
              </div>
              <Input className="w-52 rounded-full" placeholder={__('Search by keyword')} />
            </div>
          </div>
          <TableMock columns={columns} />
        </div>
      </div>
    </LockedOverlay>
  )
}
