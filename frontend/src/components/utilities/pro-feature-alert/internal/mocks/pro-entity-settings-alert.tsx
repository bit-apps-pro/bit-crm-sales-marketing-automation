import { __ } from '@common/helpers/i18nWrap'
import { Button, Radio, Tabs, Tag, Typography } from 'antd'
import { LuAlignJustify, LuColumns2, LuGripVertical, LuInfo, LuPlus } from 'react-icons/lu'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'

export interface SettingsField {
  label: string
  type: string
}

interface ProEntitySettingsAlertProps extends ProFeatureAlertProps {
  fields: SettingsField[]
}

function FieldSettingsMock({ fields }: { fields: SettingsField[] }) {
  return (
    <div className="space-y-3 rounded-lg">
      <div className="flex items-center gap-5">
        <Typography.Title className="mb-0" level={4}>
          {__('Fields')}
        </Typography.Title>
        <Button icon={<LuPlus size={14} />}>{__('Add new custom field')}</Button>
        <div className="flex items-center gap-1">
          <Radio.Group buttonStyle="solid" value={2}>
            <Radio.Button value={1}>
              <div className="flex items-center gap-1">
                <LuAlignJustify />
                {__('Single Column')}
              </div>
            </Radio.Button>
            <Radio.Button value={2}>
              <div className="flex items-center gap-1">
                <LuColumns2 />
                {__('Two Columns')}
              </div>
            </Radio.Button>
          </Radio.Group>
          <span className="flex items-center">
            <LuInfo />
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {fields.map(field => (
          <div
            className="flex items-center justify-between rounded border border-solid border-[#E5E3FE] bg-white px-3 py-3 dark:border-[#3F3A86] dark:bg-transparent"
            key={field.label}
          >
            <div className="flex items-center gap-3">
              <LuGripVertical size={14} />
              <Typography.Text>{field.label}</Typography.Text>
              <Tag color="green">{field.type}</Tag>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProEntitySettingsAlert({ featureName, fields }: ProEntitySettingsAlertProps) {
  return (
    <LockedOverlay featureName={featureName}>
      <div>
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
          <Typography.Title className="mb-0" level={2}>
            {featureName}
          </Typography.Title>
        </div>
        <Tabs
          className="mx-6 my-2"
          defaultActiveKey="field-settings"
          items={[
            {
              children: <FieldSettingsMock fields={fields} />,
              key: 'field-settings',
              label: __('Field Settings')
            }
          ]}
        />
      </div>
    </LockedOverlay>
  )
}
