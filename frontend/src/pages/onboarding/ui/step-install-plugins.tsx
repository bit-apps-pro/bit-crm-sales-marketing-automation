import { __ } from '@common/helpers/i18nWrap'
import { Button, Checkbox, Form, Typography } from 'antd'
import { type ReactNode } from 'react'
import { LuArrowLeft, LuPlug, LuShieldCheck, LuUsers } from 'react-icons/lu'

interface PluginOption {
  description: string
  icon: ReactNode
  slug: string
  tagline: string
  title: string
}

const PLUGINS: PluginOption[] = [
  {
    description: __(
      'Build drag-and-drop forms and sync new contacts straight into your CRM with Bit Form.'
    ),
    icon: <LuUsers />,
    slug: 'bit-form',
    tagline: __('Perfect for growing your audience'),
    title: __('Capture leads effortlessly')
  },
  {
    description: __('Send transactional and marketing emails straight to the inbox with Bit SMTP.'),
    icon: <LuShieldCheck />,
    slug: 'bit-smtp',
    tagline: __('Trusted, reliable inbox delivery'),
    title: __('Deliver every email reliably')
  },
  {
    description: __(
      'Connect your favorite apps and automate repetitive workflows with Bit Integration.'
    ),
    icon: <LuPlug />,
    slug: 'bit-integrations',
    tagline: __('Works with 300+ popular apps'),
    title: __('Automate your busywork')
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
          {__('Get the most out of Bit CRM')}
        </Typography.Title>
        <Typography.Text className="mb-4 text-sm text-gray-500">
          {__(
            'Turn on the features that fit your workflow. We will set them up for you — you can always change this later.'
          )}
        </Typography.Text>
        <Form.Item name="plugins" noStyle>
          <Checkbox.Group className="w-full">
            <div className="flex w-full flex-col gap-1">
              {PLUGINS.map(plugin => (
                <div className="flex items-start justify-between gap-5" key={plugin.slug}>
                  <div className="flex flex-col gap-1.5 leading-tight">
                    <span className="text-base font-semibold text-gray-800">{plugin.title}</span>
                    <span className="text-xs text-gray-500">{plugin.description}</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      {plugin.icon}
                      {plugin.tagline}
                    </span>
                  </div>
                  <Checkbox className="" value={plugin.slug} />
                </div>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      </div>

      <div className="flex items-center justify-between">
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
          {__("Let's get started")}
        </Button>
      </div>
    </div>
  )
}
