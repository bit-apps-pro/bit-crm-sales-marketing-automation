import { __ } from '@common/helpers/i18nWrap'
import { Form, type FormInstance, Input, InputNumber, Radio, Select } from 'antd'

export default function ImapForm({ form }: { form: FormInstance }) {
  const platform = Form.useWatch('platform', form)

  return (
    <Form className="py-2" form={form} layout="vertical">
      <Form.Item
        label={__('Title')}
        name="title"
        rules={[{ message: __('Title is required!'), required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={__('Platform')}
        name="platform"
        rules={[
          {
            message: __('Platform is required!'),
            required: true
          }
        ]}
      >
        <Select
          options={[
            { label: __('Gmail'), value: 'gmail' },
            { label: __('Zoho Mail'), value: 'zoho' },
            { label: __('Other'), value: 'other' }
          ]}
        />
      </Form.Item>
      <Form.Item
        hidden={platform !== 'other'}
        label={__('Host')}
        name="host"
        rules={[
          {
            message: __('Host is required!'),
            required: platform === 'other'
          }
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        hidden={platform !== 'other'}
        label={__('Port')}
        name="port"
        rules={[
          {
            message: __('Port is required!'),
            required: platform === 'other'
          }
        ]}
      >
        <InputNumber className="w-full" min={0} type="number" />
      </Form.Item>
      <Form.Item
        hidden={platform !== 'other'}
        label={__('encryption')}
        name="encryption"
        rules={[
          {
            message: __('Encryption is required!'),
            required: platform === 'other'
          }
        ]}
      >
        <Radio.Group
          options={[
            { label: __('SSL'), value: 'ssl' },
            { label: __('TLS'), value: 'tls' }
          ]}
        />
      </Form.Item>
      <Form.Item
        hidden={!platform}
        label={__('Username (Email)')}
        name="username"
        rules={[{ required: true, type: 'email' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        hidden={!platform}
        label={__('App Password')}
        name="app_password"
        rules={[
          {
            message: __('Password is required!'),
            required: true
          }
        ]}
      >
        <Input.Password size="small" />
      </Form.Item>

      <Form.Item
        help={__('If the settings are not private, other users can use them to fetch emails.')}
        hidden={!platform}
        initialValue={'no'}
        label={__('Private Settings')}
        name="is_private"
        rules={[
          {
            message: __('The private field is required!'),
            required: true
          }
        ]}
      >
        <Radio.Group
          options={[
            { label: __('Yes'), value: 'yes' },
            { label: __('No'), value: 'no' }
          ]}
        />
      </Form.Item>
    </Form>
  )
}
