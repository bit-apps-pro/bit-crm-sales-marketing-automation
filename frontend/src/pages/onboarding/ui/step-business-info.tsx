import { __ } from '@common/helpers/i18nWrap'
import logo from '@resource/logo.svg?no-inline'
import { Button, Form, type FormInstance, Input, Typography } from 'antd'

import { type OnboardingType } from '../onboarding'

interface StepBusinessInfoProps {
  form: FormInstance<OnboardingType>
  onNext: () => void
}

export default function StepBusinessInfo({ form, onNext }: StepBusinessInfoProps) {
  const handleNext = async () => {
    try {
      await form.validateFields(['name', 'email'])
      onNext()
    } catch {
      // antd shows the inline errors; nothing else to do.
    }
  }

  const handleSkip = () => {
    form.resetFields(['name', 'email'])
    onNext()
  }

  return (
    <div className="flex h-full flex-col">
      <img alt="Bit CRM Logo" className="mb-4 h-12 w-12" src={logo} />
      <Typography.Title className="mb-2" level={3}>
        {__('Welcome to')} <span className="text-primary">{__('Bit CRM')}</span>
      </Typography.Title>
      <Typography.Text className="mb-6 text-sm text-gray-500" type="secondary">
        {__('Tell us a bit about your business to personalize your CRM experience.')}
      </Typography.Text>

      <Form.Item
        label={__('Business Name')}
        name="name"
        rules={[{ message: __('Business name is required'), required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={__('Business Email')}
        name="email"
        rules={[
          { message: __('Business email is required'), required: true },
          { message: __('Enter a valid email'), type: 'email' }
        ]}
      >
        <Input />
      </Form.Item>

      <div className="mt-auto flex justify-between gap-3 pt-6">
        <Button className="rounded-full" onClick={handleSkip} type="text">
          {__('Skip')}
        </Button>
        <Button className="rounded-full" onClick={handleNext} type="primary">
          {__('Next')}
        </Button>
      </div>
    </div>
  )
}
