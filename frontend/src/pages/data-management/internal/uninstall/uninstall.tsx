import { __ } from '@common/helpers/i18nWrap'
import { Skeleton, Switch, Typography } from 'antd'

import useUninstallSetting from './data/use-uninstall-setting'
import useUpdateUninstallSetting from './data/use-update-uninstall-setting'

const { Text, Title } = Typography

export default function Uninstall() {
  const { isUninstallSettingLoading, uninstallSetting } = useUninstallSetting()
  const { isUpdatingUninstallSetting, updateUninstallSetting } = useUpdateUninstallSetting()

  if (isUninstallSettingLoading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    )
  }

  return (
    <div className="rounded-md border border-solid border-red-300 dark:border-red-800">
      <div className="flex items-center border-0 border-b border-solid border-red-300 px-6 py-3 dark:border-red-800">
        <Title className="mb-0" level={5}>
          {__('Plugin Uninstall')}
        </Title>
      </div>
      <div className="flex items-center justify-between gap-6 px-6 py-4">
        <div className="flex-1">
          <Text className="block font-medium">{__('Erase all plugin data on deletion')}</Text>
          <Text className="block text-sm" type="secondary">
            {__(
              'When you delete Bit CRM from the Plugins screen, every contact, lead, company, deal, invoice, note, setting and log is permanently removed. Deactivating keeps everything. This cannot be undone.'
            )}
          </Text>
        </div>
        <div className="shrink-0">
          <Switch
            checked={uninstallSetting?.erase_on_uninstall ?? false}
            disabled={isUpdatingUninstallSetting}
            loading={isUpdatingUninstallSetting}
            onChange={checked => updateUninstallSetting({ erase_on_uninstall: checked })}
          />
        </div>
      </div>
    </div>
  )
}
