import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import FieldSettings from '@features/field-settings'
import { Tabs, Typography } from 'antd'
import { useSearchParams } from 'react-router'

import ConversionMapping from './internal/conversion-mapping'

export default function LeadSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'field-settings'

  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
        <Typography.Title className="mb-0" level={2}>
          {__('Lead Settings')}
        </Typography.Title>
      </div>
      <Tabs
        activeKey={defaultActiveTab}
        className="mx-6 my-2"
        destroyOnHidden
        items={[
          {
            children: <FieldSettings module={MODULES.LEAD} />,
            key: 'field-settings',
            label: __('Field Settings')
          },
          {
            children: <ConversionMapping />,
            key: 'conversion-mapping',
            label: __('Conversion Mapping')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
