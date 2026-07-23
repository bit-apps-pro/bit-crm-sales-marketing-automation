import { __ } from '@common/helpers/i18nWrap'
import { Button, Checkbox, Tabs, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'

const MODULES = [
  { checked: true, label: __('Dashboard'), permission: __('View') },
  { checked: true, label: __('Contact'), permission: __('View & Edit') },
  { checked: false, label: __('Deal'), permission: __('View') },
  { checked: false, label: __('Invoice'), permission: __('View') }
]

const CONTACT_FIELDS = [__('First Name'), __('Last Name'), __('Email'), __('Phone')]
const DEAL_FIELDS = [__('Deal Name'), __('Contact'), __('Amount'), __('Stage')]

function ModulePermissionsMock() {
  return (
    <div className="rounded-md border border-solid border-[#EBEAFF] bg-white p-4 dark:border-[#3F3A86] dark:bg-neutral-900">
      <div className="mb-4">
        <Typography.Text className="block" strong>
          {__('Module Permissions')}
        </Typography.Text>
        <Typography.Text className="mb-0 mt-1 text-xs text-gray-400">
          {__('Set the default modules a client can access when you grant them portal access.')}
        </Typography.Text>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {MODULES.map(module => (
          <div className="rounded-md bg-white p-4 shadow-sm dark:bg-neutral-800" key={module.label}>
            <Typography.Title className="mb-2" level={5}>
              {module.label}
            </Typography.Title>
            <Checkbox checked={module.checked}>{module.permission}</Checkbox>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button className="rounded-full" type="primary">
          {__('Save')}
        </Button>
      </div>
    </div>
  )
}

function FieldPermissionsMock({ fields, title }: { fields: string[]; title: string }) {
  return (
    <div className="rounded-md border border-solid border-[#EBEAFF] bg-white py-4 dark:border-[#3F3A86] dark:bg-neutral-900">
      <Typography.Text className="block px-4 pb-3" strong>
        {title}
      </Typography.Text>
      {fields.map((field, index) => (
        <div
          className="flex items-center justify-between border-0 border-t border-solid border-[#EBEAFF] px-4 py-2 dark:border-neutral-700"
          key={field}
        >
          <Typography.Text>{field}</Typography.Text>
          <Checkbox checked={index < 2}>{__('View')}</Checkbox>
        </div>
      ))}
    </div>
  )
}

function PermissionsMock() {
  return (
    <div className="space-y-5">
      <ModulePermissionsMock />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <FieldPermissionsMock fields={CONTACT_FIELDS} title={__('Contact Field Permissions')} />
        <FieldPermissionsMock fields={DEAL_FIELDS} title={__('Deal Field Permissions')} />
      </div>
    </div>
  )
}

export default function ProPortalSettingsAlert({ featureName }: ProFeatureAlertProps) {
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
          defaultActiveKey="permissions"
          items={[
            { children: <PermissionsMock />, key: 'permissions', label: __('Permissions') },
            { key: 'clients', label: __('Clients') },
            { key: 'white-label', label: __('White Label') }
          ]}
        />
      </div>
    </LockedOverlay>
  )
}
