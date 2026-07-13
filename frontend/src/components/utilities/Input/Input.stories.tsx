import { __ } from '@common/helpers/i18nWrap'
import { type Meta, type StoryFn } from '@storybook/react'

import Input from './Input'

export const Template: StoryFn<typeof Input> = args => (
  <div>
    <div className="flx ai-end mb-6">
      <div className="mr-2">
        <Input
          {...args}
          label={args.title || __('Outline Input')}
          placeholder={args.placeholder || __('large')}
          size="large"
        />
      </div>
      <div className="mr-2">
        <Input {...args} placeholder={args.placeholder || __('middle')} size="middle" />
      </div>
      <div className="mr-2">
        <Input {...args} placeholder={args.placeholder || __('small')} size="small" />
      </div>
    </div>
  </div>
)

export default {
  argTypes: {
    label: {
      control: 'text'
    },
    placeholder: {
      control: 'text'
    },
    size: {
      control: false
    }
  },
  component: Input,
  title: __('Component/Input')
} as Meta<typeof Input>
