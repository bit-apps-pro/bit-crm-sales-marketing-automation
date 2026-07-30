import { __ } from '@common/helpers/i18nWrap'
import { Button, Form, Input, InputNumber, Space, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'

export default function ProActivityLogsAlert({ featureName }: ProFeatureAlertProps) {
  return (
    <LockedOverlay featureName={featureName}>
      <div className="max-w-2xl space-y-4 p-4">
        <Form layout="vertical">
          <div className="rounded-lg border border-solid border-[#E5E3FE] p-4 dark:border-gray-700">
            <div className="mb-2 flex items-center gap-3">
              <Typography.Text className="block font-semibold text-gray-800 dark:text-gray-100">
                {__('Preserve Activity Logs')}
              </Typography.Text>
            </div>

            <Form.Item className="mb-2">
              <Space.Compact>
                <InputNumber className="w-32" min={0} placeholder="30" size="middle" />
                <Input readOnly size="middle" style={{ width: 60 }} value={__('Days')} />
              </Space.Compact>
            </Form.Item>

            <Typography.Text className="mb-2 block text-xs text-gray-500 dark:text-gray-400">
              {__('Enter the number of days to retain activity logs.')}
            </Typography.Text>
            <ul className="mb-6 mt-1 list-disc space-y-1 pl-4 text-xs text-gray-400 dark:text-gray-500">
              <li>{__('Entering 30 will remove logs older than 30 days.')}</li>
              <li>{__('Entering 0 will keep all logs indefinitely.')}</li>
              <li>{__('Defaults to 30 days when not configured.')}</li>
              <li>
                {__(
                  'This permanently deletes record timeline history for leads, contacts, companies, deals, products and invoices.'
                )}
              </li>
            </ul>

            <div className="flex justify-end">
              <Button className="rounded-full px-6" type="primary">
                {__('Save')}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </LockedOverlay>
  )
}
