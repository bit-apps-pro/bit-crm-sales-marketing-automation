import { __ } from '@common/helpers/i18nWrap'
import { Button, Checkbox, Form, Typography } from 'antd'
import { type ReactNode } from 'react'
import { LuArrowLeft, LuPlug, LuShieldCheck, LuUsers } from 'react-icons/lu'

interface PluginOption {
  description: string
  icon: ReactNode
  slug: string
  title: string
}

const PLUGINS: PluginOption[] = [
  {
    description: __('Install Bit Form to collect leads and sync them to Bit CRM as leads for FREE.'),
    icon: <LuUsers />,
    slug: 'bit-form',
    title: __('Capture leads automatically')
  },
  {
    description: __(
      'Install Bit Integrations to capture WordPress events and sync them to your CRM as leads and contacts.'
    ),
    icon: <LuPlug />,
    slug: 'bit-integrations',
    title: __('Integrate with the WordPress ecosystem')
  },
  {
    description: __(
      "Install Bit SMTP to configure SMTP and make sure transactional emails reach your user's inboxes."
    ),
    icon: <LuShieldCheck />,
    slug: 'bit-smtp',
    title: __('Deliver emails to the inbox')
  }
]

export const DEFAULT_PLUGIN_SLUGS = PLUGINS.map(p => p.slug)

interface StepInstallPluginsProps {
  finishing: boolean
  onBack: () => void
  onFinish: () => void
}

export default function StepInstallPlugins({ finishing, onBack, onFinish }: StepInstallPluginsProps) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <Typography.Title className="mb-0" level={3}>
          {__('Almost done!')}
        </Typography.Title>
        <Typography.Text className="mb-4 text-sm" type="secondary">
          {__(
            'Thanks for configuring your CRM. These solutions will help you manage your entire sales pipeline.'
          )}
        </Typography.Text>
        <Form.Item name="plugins" noStyle>
          <Checkbox.Group className="w-full">
            <div className="flex w-full flex-col gap-1">
              {PLUGINS.map(plugin => (
                <div className="flex items-start justify-between gap-5" key={plugin.slug}>
                  <div className="flex flex-col gap-1.5 leading-tight">
                    <Typography.Title className="mb-0" level={5}>
                      {plugin.title}
                    </Typography.Title>
                    <Typography.Text className="text-sm" type="secondary">
                      {plugin.description}
                    </Typography.Text>
                  </div>
                  <Checkbox className="" value={plugin.slug} />
                </div>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      </div>

      <div className="flex items-center justify-between gap-3 pt-6">
        <Button
          className="rounded-full"
          disabled={finishing}
          icon={<LuArrowLeft />}
          onClick={onBack}
          type="text"
        >
          {__('Back')}
        </Button>
        <Button
          className="rounded-full"
          disabled={finishing}
          loading={finishing}
          onClick={onFinish}
          type="primary"
        >
          {__('Complete Setup')}
        </Button>
      </div>
    </div>
  )
}
