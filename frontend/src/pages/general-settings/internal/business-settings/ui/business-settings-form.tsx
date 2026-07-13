import { __ } from '@common/helpers/i18nWrap'
import customizedRequiredMark from '@utilities/customized-required-mark/customized-required-mark'
import { Button, type FormInstance, Input, Typography } from 'antd'
import { Form } from 'antd'

import { type BusinessSettings } from '../shared/types'
import BusinessLogoUpload from './business-logo-upload'

interface BusinessSettingsFormProps {
  form: FormInstance<BusinessSettings>
  handleFormSubmit: () => Promise<void>
  isLoading: boolean
}

export default function BusinessSettingsForm({
  form,
  handleFormSubmit,
  isLoading
}: BusinessSettingsFormProps) {
  return (
    <Form form={form} layout="vertical" requiredMark={customizedRequiredMark}>
      <Typography.Title className="mb-0" level={4}>
        {__('Business Logo')}
      </Typography.Title>
      <Typography.Text className="mb-4 block text-sm" type="secondary">
        {__('Upload your business logo (PNG, JPG, SVG, max 2MB). Recommended size: 200x200px')}
      </Typography.Text>
      <Form.Item className="mb-8" name="logo_url">
        <BusinessLogoUpload />
      </Form.Item>

      <Typography.Title level={4}>{__('Business Details')}</Typography.Title>

      <div className="mb-8 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <Form.Item
          className="mb-0"
          label={__('Business Name')}
          name="name"
          rules={[{ message: __('Business name is required'), required: true }]}
        >
          <Input placeholder={__('Enter business name')} size="middle" />
        </Form.Item>

        <Form.Item
          className="mb-0"
          label={__('Email Address')}
          name="email"
          rules={[
            { message: __('Email is required'), required: true },
            { message: __('Please enter a valid email'), type: 'email' }
          ]}
        >
          <Input placeholder={__('business@example.com')} size="middle" type="email" />
        </Form.Item>

        <Form.Item className="mb-0" label={__('Mobile Number')} name="mobile_number">
          <Input placeholder={__('+1 (555) 111-2222')} size="middle" />
        </Form.Item>

        <Form.Item className="mb-0" label={__('Fax')} name="fax_number">
          <Input placeholder={__('Enter fax number')} size="middle" />
        </Form.Item>

        <Form.Item className="mb-0" label={__('Phone Number')} name="phone_number">
          <Input placeholder={__('+1 (555) 000-0000')} size="middle" />
        </Form.Item>

        <Form.Item className="mb-0" label={__('Website')} name="website">
          <Input placeholder={__('https://example.com')} size="middle" />
        </Form.Item>
      </div>

      <Typography.Title level={4}>{__('Business Address')}</Typography.Title>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <Form.Item className="mb-0 md:col-span-2" label={__('Street Address')} name="street">
          <Input placeholder={__('Enter street address')} size="middle" />
        </Form.Item>

        <Form.Item className="mb-0" label={__('City')} name="city">
          <Input placeholder={__('Enter city')} size="middle" />
        </Form.Item>

        <Form.Item className="mb-0" label={__('State')} name="state">
          <Input placeholder={__('Enter state')} size="middle" />
        </Form.Item>

        <Form.Item className="mb-0" label={__('Zip/Postal Code')} name="postal_code">
          <Input placeholder={__('Enter zip code')} size="middle" />
        </Form.Item>

        <Form.Item className="mb-0" label={__('Country')} name="country">
          <Input placeholder={__('Enter country')} size="middle" />
        </Form.Item>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pb-2 pt-6 dark:border-gray-700">
        <Button
          className="rounded-full"
          loading={isLoading}
          onClick={handleFormSubmit}
          size="middle"
          type="primary"
        >
          {__('Save Changes')}
        </Button>
      </div>
    </Form>
  )
}
