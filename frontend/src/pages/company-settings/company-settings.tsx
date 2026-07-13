import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import FieldSettings from '@features/field-settings'
import { Tabs, Typography } from 'antd'
import { useSearchParams } from 'react-router'

export default function CompanySettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'field-settings'

  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
        <Typography.Title className="mb-0" level={2}>
          {__('Company Settings')}
        </Typography.Title>
      </div>
      <Tabs
        className="mx-6 my-2"
        defaultActiveKey={defaultActiveTab}
        items={[
          {
            children: <FieldSettings module={MODULES.COMPANY} />,
            key: 'field-settings',
            label: __('Field Settings')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
