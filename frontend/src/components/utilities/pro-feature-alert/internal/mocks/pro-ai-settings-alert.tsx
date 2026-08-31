import { __ } from '@common/helpers/i18nWrap'
import { AutoComplete, Button, Form, Input, Select, Space, Switch, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'

const { Text, Title } = Typography

export default function ProAiSettingsAlert({ featureName }: ProFeatureAlertProps) {
  return (
    <LockedOverlay featureName={featureName}>
      <div>
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
          <Title className="mb-0" level={2}>
            {__('AI Assistant')}
          </Title>
        </div>

        <div className="flex items-center justify-between gap-6 border-0 border-b border-solid border-[#E5E3FE] px-6 py-4 dark:border-neutral-700">
          <div className="flex-1">
            <Text className="block font-medium">{__('Enable AI Assistant')}</Text>
            <Text className="block text-sm" type="secondary">
              {__(
                'Adds a chat button to every CRM screen. It can read and change records strictly within what the person asking is allowed to do, and reports each change once it has been made.'
              )}
            </Text>
          </div>
          <div className="shrink-0">
            <Switch checked />
          </div>
        </div>

        <div className="mx-6 my-2 max-w-2xl">
          <Form layout="vertical">
            <Title className="mb-3 mt-0" level={5}>
              {__('Connection')}
            </Title>

            <div className="mb-6 space-y-4">
              <Form.Item className="mb-0" label={__('Provider')}>
                <Select size="middle" value={__('Claude')} />
              </Form.Item>

              <Form.Item className="mb-0" label={__('Model')}>
                <AutoComplete size="middle" value="claude-opus-5" />
              </Form.Item>

              <Form.Item className="mb-0" label={__('API key')}>
                <Space.Compact block>
                  <Input.Password
                    className="[&>input]:!min-h-0 [&>input]:!p-0"
                    placeholder="sk-ant-..."
                  />
                  <Button className="h-10">{__('Test')}</Button>
                </Space.Compact>
              </Form.Item>
            </div>

            <Title className="mb-3 mt-0" level={5}>
              {__('Answers')}
            </Title>

            <div className="space-y-4">
              <Form.Item className="mb-0" label={__('Thoroughness')}>
                <Select size="middle" value="medium" />
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </LockedOverlay>
  )
}
