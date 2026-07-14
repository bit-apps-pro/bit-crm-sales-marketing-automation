import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import FieldSettings from '@features/field-settings'
import { Tabs, Typography } from 'antd'
import { useSearchParams } from 'react-router'

import ArchivedStages from './ui/archived-stages'
import Stages from './ui/stages'

export default function DealSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultActiveTab = searchParams.get('tab') || 'field-settings'

  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
        <Typography.Title className="mb-0" level={2}>
          {__('Deal Settings')}
        </Typography.Title>
      </div>
      <Tabs
        activeKey={defaultActiveTab}
        animated
        className="mx-6 my-2"
        items={[
          {
            children: <FieldSettings module={MODULES.DEAL} />,
            key: 'field-settings',
            label: __('Field Settings')
          },
          {
            children: <Stages />,
            key: 'stages',
            label: __('Stage Settings')
          },
          {
            children: <ArchivedStages />,
            key: 'archived-stages',
            label: __('Archived Stages')
          }
        ]}
        onChange={path => setSearchParams({ tab: path })}
      />
    </div>
  )
}
